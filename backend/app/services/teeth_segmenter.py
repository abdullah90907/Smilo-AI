import os
import json
import numpy as np
import cv2
import tensorflow as tf

from PIL import Image, ImageOps
from huggingface_hub import snapshot_download


class TeethSegmenter:
    def __init__(self, model_repo: str, static_root: str = "static"):
        self.static_root = static_root
        self.model_repo = model_repo
        
        self.MASK_THRESHOLD = 0.50
        self.MIN_COMPONENT_AREA_RATIO = 0.00045
        self.USE_LETTERBOX = True
        self.CROP_PADDING_RATIO = 0.06
        
        self.model, self.infer, self.input_key, self.target_w, self.target_h, self.channels = self.load_segmentation_model(model_repo)

    def get_resample_filter(self):
        try:
            return Image.Resampling.BILINEAR
        except AttributeError:
            return Image.BILINEAR

    def load_segmentation_model(self, repo_id):
        print("Downloading/loading model from Hugging Face...")
        model_dir = snapshot_download(repo_id=repo_id)

        model = tf.saved_model.load(model_dir)
        infer = model.signatures["serving_default"]

        input_signature = infer.structured_input_signature[1]

        if len(input_signature) == 0:
            raise RuntimeError("Could not detect model input signature.")

        input_key = list(input_signature.keys())[0]
        input_spec = input_signature[input_key]

        shape = input_spec.shape.as_list()

        target_h = shape[1] if len(shape) > 1 and shape[1] is not None else 512
        target_w = shape[2] if len(shape) > 2 and shape[2] is not None else 512
        channels = shape[-1] if len(shape) > 3 and shape[-1] is not None else 1

        if channels not in [1, 3]:
            print(f"Unexpected channel count {channels}; using grayscale channel=1.")
            channels = 1

        print("Model loaded successfully.")
        print("Input key:", input_key)
        print("Expected input size:", target_w, "x", target_h)
        print("Expected channels:", channels)

        return model, infer, input_key, int(target_w), int(target_h), int(channels)

    def prepare_image_for_model(self, image_path, target_w, target_h, channels=1, use_letterbox=True):
        pil_img = Image.open(image_path)
        pil_img = ImageOps.exif_transpose(pil_img)

        if channels == 1:
            pil_img = pil_img.convert("L")
            background = 0
            mode = "L"
        else:
            pil_img = pil_img.convert("RGB")
            background = (0, 0, 0)
            mode = "RGB"

        orig_w, orig_h = pil_img.size
        resample = self.get_resample_filter()

        if use_letterbox:
            scale = min(target_w / orig_w, target_h / orig_h)
            new_w = max(1, int(round(orig_w * scale)))
            new_h = max(1, int(round(orig_h * scale)))

            resized = pil_img.resize((new_w, new_h), resample)

            canvas = Image.new(mode, (target_w, target_h), background)
            pad_left = (target_w - new_w) // 2
            pad_top = (target_h - new_h) // 2
            canvas.paste(resized, (pad_left, pad_top))

            meta = {
                "orig_w": orig_w,
                "orig_h": orig_h,
                "target_w": target_w,
                "target_h": target_h,
                "new_w": new_w,
                "new_h": new_h,
                "pad_left": pad_left,
                "pad_top": pad_top,
                "use_letterbox": True,
            }

            model_img = canvas

        else:
            model_img = pil_img.resize((target_w, target_h), resample)

            meta = {
                "orig_w": orig_w,
                "orig_h": orig_h,
                "target_w": target_w,
                "target_h": target_h,
                "new_w": target_w,
                "new_h": target_h,
                "pad_left": 0,
                "pad_top": 0,
                "use_letterbox": False,
            }

        arr = np.asarray(model_img).astype(np.float32) / 255.0

        if channels == 1:
            arr = np.expand_dims(arr, axis=-1)

        x = np.expand_dims(arr, axis=0)
        x = tf.constant(x, dtype=tf.float32)

        return pil_img, model_img, x, meta

    def run_inference(self, infer, input_key, x):
        prediction = infer(**{input_key: x})

        if not isinstance(prediction, dict):
            raise RuntimeError("Model output is not a dictionary.")

        output_key = list(prediction.keys())[0]
        pred = prediction[output_key].numpy()

        mask = np.squeeze(pred)

        if mask.ndim == 3:
            mask = mask[:, :, 0]

        if mask.min() < 0 or mask.max() > 1:
            mask = 1.0 / (1.0 + np.exp(-mask))

        mask = np.clip(mask, 0, 1).astype(np.float32)

        print("Prediction complete.")
        print("Output key:", output_key)
        print("Mask range:", float(mask.min()), "to", float(mask.max()))

        return mask, output_key

    def restore_mask_to_original_size(self, mask, meta):
        target_w = meta["target_w"]
        target_h = meta["target_h"]
        orig_w = meta["orig_w"]
        orig_h = meta["orig_h"]

        mask = cv2.resize(mask, (target_w, target_h), interpolation=cv2.INTER_LINEAR)

        if meta["use_letterbox"]:
            x1 = meta["pad_left"]
            y1 = meta["pad_top"]
            x2 = x1 + meta["new_w"]
            y2 = y1 + meta["new_h"]

            mask = mask[y1:y2, x1:x2]

        restored = cv2.resize(mask, (orig_w, orig_h), interpolation=cv2.INTER_LINEAR)
        restored = np.clip(restored, 0, 1).astype(np.float32)

        return restored

    def clean_segmentation_mask(self, prob_mask, threshold=0.50, min_area_ratio=0.00045):
        binary = (prob_mask >= threshold).astype(np.uint8)

        h, w = binary.shape

        kernel_size = max(3, int(round(min(h, w) * 0.006)))
        if kernel_size % 2 == 0:
            kernel_size += 1

        kernel = np.ones((kernel_size, kernel_size), np.uint8)

        cleaned = cv2.morphologyEx(binary * 255, cv2.MORPH_CLOSE, kernel, iterations=2)
        cleaned = cv2.morphologyEx(cleaned, cv2.MORPH_OPEN, kernel, iterations=1)

        num_labels, labels, stats, _ = cv2.connectedComponentsWithStats(cleaned, connectivity=8)

        min_area = max(120, int(h * w * min_area_ratio))

        final_mask = np.zeros((h, w), dtype=np.uint8)
        kept_components = 0

        for i in range(1, num_labels):
            area = stats[i, cv2.CC_STAT_AREA]
            comp_w = stats[i, cv2.CC_STAT_WIDTH]
            comp_h = stats[i, cv2.CC_STAT_HEIGHT]

            good_area = area >= min_area
            good_width = comp_w >= max(8, int(w * 0.01))
            good_height = comp_h >= max(8, int(h * 0.01))

            if good_area and good_width and good_height:
                final_mask[labels == i] = 255
                kept_components += 1

        if kept_components == 0:
            print("Warning: cleaning removed all components. Falling back to raw threshold mask.")
            final_mask = binary * 255

        final_binary = (final_mask > 0).astype(np.uint8)

        return final_binary, final_mask

    def create_visual_outputs(self, original_pil, prob_mask, binary_mask):
        original_gray = np.asarray(original_pil.convert("L")).astype(np.float32)
        original_rgb = np.asarray(original_pil.convert("RGB")).astype(np.uint8)

        smooth_kernel = 9
        smooth_mask = cv2.GaussianBlur(binary_mask.astype(np.float32), (smooth_kernel, smooth_kernel), 0)
        smooth_mask = np.clip(smooth_mask, 0, 1)

        visual_extracted = original_gray * smooth_mask
        visual_extracted = np.clip(visual_extracted, 0, 255).astype(np.uint8)

        prob_mask_uint8 = (prob_mask * 255).astype(np.uint8)
        binary_mask_uint8 = (binary_mask * 255).astype(np.uint8)

        overlay = original_rgb.copy()
        mask_bool = binary_mask.astype(bool)

        overlay_color = np.array([0, 255, 0], dtype=np.uint8)
        alpha = 0.35
        overlay[mask_bool] = (
            original_rgb[mask_bool] * (1 - alpha) + overlay_color * alpha
        ).astype(np.uint8)

        return prob_mask_uint8, binary_mask_uint8, visual_extracted, overlay

    def create_ml_ready_outputs(self, original_pil, binary_mask, padding_ratio=0.06):
        original_gray = np.asarray(original_pil.convert("L")).astype(np.uint8)
        mask = (binary_mask > 0).astype(np.uint8)

        h, w = original_gray.shape
        ys, xs = np.where(mask > 0)

        if len(xs) == 0 or len(ys) == 0:
            raise RuntimeError("Segmentation mask is empty. Cannot create ML-ready crop.")

        x1, x2 = xs.min(), xs.max()
        y1, y2 = ys.min(), ys.max()

        pad_x = int((x2 - x1) * padding_ratio)
        pad_y = int((y2 - y1) * padding_ratio)

        x1 = max(0, x1 - pad_x)
        x2 = min(w, x2 + pad_x)
        y1 = max(0, y1 - pad_y)
        y2 = min(h, y2 + pad_y)

        teeth_crop_original_pixels = original_gray[y1:y2, x1:x2]

        teeth_crop_binary_mask = mask[y1:y2, x1:x2]

        teeth_crop_masked_original_pixels = teeth_crop_original_pixels.copy()
        teeth_crop_masked_original_pixels[teeth_crop_binary_mask == 0] = 0

        full_masked_original_pixels = original_gray.copy()
        full_masked_original_pixels[mask == 0] = 0

        full_binary_mask_uint8 = (mask * 255).astype(np.uint8)
        teeth_crop_binary_mask_uint8 = (teeth_crop_binary_mask * 255).astype(np.uint8)

        bbox = {
            "x1": int(x1),
            "y1": int(y1),
            "x2": int(x2),
            "y2": int(y2),
            "crop_width": int(x2 - x1),
            "crop_height": int(y2 - y1),
            "original_width": int(w),
            "original_height": int(h),
            "padding_ratio": float(padding_ratio),
        }

        return {
            "full_masked_original_pixels": full_masked_original_pixels,
            "teeth_crop_original_pixels": teeth_crop_original_pixels,
            "teeth_crop_binary_mask": teeth_crop_binary_mask_uint8,
            "teeth_crop_masked_original_pixels": teeth_crop_masked_original_pixels,
            "full_binary_mask": full_binary_mask_uint8,
            "bbox": bbox,
        }

    def save_png_lossless(self, array, path):
        Image.fromarray(array).save(path, compress_level=0)

    def segment_image(
        self,
        image_path: str,
        case_id: str,
        force_resegment: bool = False
    ) -> dict:
        output_dir = os.path.join(self.static_root, "segmentations", case_id)
        os.makedirs(output_dir, exist_ok=True)

        clean_mask_path = os.path.join(output_dir, "clean_binary_mask.png")
        original_path = os.path.join(output_dir, "original.png")

        reused_mask = False
        metadata = {}

        if os.path.exists(clean_mask_path) and os.path.exists(original_path) and not force_resegment:
            reused_mask = True
            original_pil = Image.open(original_path)
            binary_mask_uint8 = np.array(Image.open(clean_mask_path))
            binary_mask = (binary_mask_uint8 > 0).astype(np.uint8)

            prob_mask_original_size = binary_mask.astype(np.float32)
            meta = {}
            ml_outputs = self.create_ml_ready_outputs(
                original_pil, binary_mask, self.CROP_PADDING_RATIO)
            _, _, visual_extracted, overlay = self.create_visual_outputs(
                original_pil, prob_mask_original_size, binary_mask)

            metadata = {
                "reused_mask": True,
                "note": "No brightness, contrast, filter, or AI enhancement was applied to ML-ready outputs.",
                "best_input_for_future_disease_detection": "teeth_crop_original_pixels.png",
                "best_mask_for_future_disease_detection": "teeth_crop_binary_mask.png",
                "crop_bbox": ml_outputs["bbox"],
            }
        else:
            reused_mask = False
            original_pil, model_img, x, meta = self.prepare_image_for_model(
                image_path=image_path,
                target_w=self.target_w,
                target_h=self.target_h,
                channels=self.channels,
                use_letterbox=self.USE_LETTERBOX
            )

            mask_model_size, output_key = self.run_inference(self.infer, self.input_key, x)

            prob_mask_original_size = self.restore_mask_to_original_size(mask_model_size, meta)

            binary_mask, binary_mask_uint8_raw = self.clean_segmentation_mask(
                prob_mask=prob_mask_original_size,
                threshold=self.MASK_THRESHOLD,
                min_area_ratio=self.MIN_COMPONENT_AREA_RATIO
            )

            prob_mask_uint8, binary_mask_uint8, visual_extracted, overlay = self.create_visual_outputs(
                original_pil=original_pil,
                prob_mask=prob_mask_original_size,
                binary_mask=binary_mask
            )

            ml_outputs = self.create_ml_ready_outputs(
                original_pil=original_pil,
                binary_mask=binary_mask,
                padding_ratio=self.CROP_PADDING_RATIO
            )

            metadata = {
                "reused_mask": False,
                "note": "No brightness, contrast, filter, or AI enhancement was applied to ML-ready outputs.",
                "best_input_for_future_disease_detection": "teeth_crop_original_pixels.png",
                "best_mask_for_future_disease_detection": "teeth_crop_binary_mask.png",
                "model_preprocessing_meta": meta,
                "crop_bbox": ml_outputs["bbox"],
            }

            self.save_png_lossless(ml_outputs["full_masked_original_pixels"], os.path.join(output_dir, "full_masked_original_pixels.png"))
            self.save_png_lossless(ml_outputs["teeth_crop_masked_original_pixels"], os.path.join(output_dir, "teeth_crop_masked_original_pixels.png"))

        original_pil.convert("RGB").save(original_path, compress_level=0)
        self.save_png_lossless(binary_mask_uint8, clean_mask_path)
        self.save_png_lossless(visual_extracted, os.path.join(output_dir, "visual_teeth_extracted.png"))
        Image.fromarray(overlay).save(os.path.join(output_dir, "overlay.png"), compress_level=0)
        self.save_png_lossless(ml_outputs["teeth_crop_original_pixels"], os.path.join(output_dir, "teeth_crop_original_pixels.png"))
        self.save_png_lossless(ml_outputs["teeth_crop_binary_mask"], os.path.join(output_dir, "teeth_crop_binary_mask.png"))

        with open(os.path.join(output_dir, "metadata.json"), "w") as f:
            json.dump(metadata, f, indent=4)

        paths = {
            "original": os.path.join(self.static_root, "segmentations", case_id, "original.png"),
            "overlay": os.path.join(self.static_root, "segmentations", case_id, "overlay.png"),
            "visual_teeth_extracted": os.path.join(self.static_root, "segmentations", case_id, "visual_teeth_extracted.png"),
            "clean_binary_mask": os.path.join(self.static_root, "segmentations", case_id, "clean_binary_mask.png"),
            "metadata": os.path.join(self.static_root, "segmentations", case_id, "metadata.json"),
            "teeth_crop_original_pixels": os.path.join(self.static_root, "segmentations", case_id, "teeth_crop_original_pixels.png"),
            "teeth_crop_binary_mask": os.path.join(self.static_root, "segmentations", case_id, "teeth_crop_binary_mask.png"),
        }

        urls = {
            "overlay_url": f"/{self.static_root}/segmentations/{case_id}/overlay.png",
            "visual_teeth_extracted_url": f"/{self.static_root}/segmentations/{case_id}/visual_teeth_extracted.png",
            "clean_binary_mask_url": f"/{self.static_root}/segmentations/{case_id}/clean_binary_mask.png",
            "metadata_url": f"/{self.static_root}/segmentations/{case_id}/metadata.json",
        }

        return {
            "success": True,
            "case_id": case_id,
            "paths": paths,
            "urls": urls,
            "metadata": metadata,
        }

