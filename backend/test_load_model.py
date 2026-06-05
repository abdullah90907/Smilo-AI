
print("Starting test...")

try:
    print("Importing huggingface_hub...")
    from huggingface_hub import from_pretrained_keras
    print("✅ Imported huggingface_hub successfully!")
    
    print("Importing tensorflow...")
    import tensorflow as tf
    print(f"✅ Imported tensorflow successfully! Version: {tf.__version__}")
    
    print("Loading segmentation model...")
    model = from_pretrained_keras("SerdarHelli/Segmentation-of-Teeth-in-Panoramic-X-ray-Image-Using-U-Net")
    print("✅ Segmentation model loaded successfully!")
    
    print(f"Model input shape: {model.input_shape}")
    print(f"Model output shape: {model.output_shape}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
