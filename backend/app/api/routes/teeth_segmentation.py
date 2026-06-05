from fastapi import APIRouter, UploadFile, File, HTTPException, Query
from fastapi.responses import JSONResponse
from typing import Optional
from uuid import uuid4
import os
import io
from PIL import Image

router = APIRouter(prefix="/api/teeth", tags=["teeth-segmentation"])

teeth_segmenter = None

def set_teeth_segmenter(segmenter):
    global teeth_segmenter
    teeth_segmenter = segmenter


@router.post("/segment")
async def segment_teeth(
    file: UploadFile = File(...),
    force_resegment: bool = Query(False)
):
    """
    Endpoint for teeth segmentation
    """
    if not teeth_segmenter:
        raise HTTPException(status_code=503, detail="Teeth segmenter service not available")

    # 1. Validate allowed image types
    valid_content_types = ["image/jpeg", "image/png", "image/jpg", "image/webp"]
    if file.content_type not in valid_content_types:
        raise HTTPException(status_code=400, detail=f"Invalid file type. Allowed types: JPEG, PNG, WEBP")

    try:
        # 2. Generate unique case_id
        case_id = str(uuid4())

        # 3. Create folder: static/segmentations/{case_id}
        output_dir = os.path.join("static", "segmentations", case_id)
        os.makedirs(output_dir, exist_ok=True)

        # 4. Save uploaded image as original.png
        original_image_path = os.path.join(output_dir, "original.png")

        contents = await file.read()
        original_image = Image.open(io.BytesIO(contents))
        original_image.convert("RGB").save(original_image_path, compress_level=0)

        # 5. Call segment_image
        result = teeth_segmenter.segment_image(
            image_path=original_image_path,
            case_id=case_id,
            force_resegment=force_resegment
        )

        # 6. Return JSON
        return JSONResponse(content={
            "success": True,
            "case_id": case_id,
            "outputs": result["urls"],
            "message": "Teeth segmentation completed successfully."
        })

    except HTTPException:
        raise
    except Exception as e:
        print(f"Error in /api/teeth/segment: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="An unexpected error occurred during teeth segmentation.")

