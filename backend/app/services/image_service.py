import cloudinary
import cloudinary.uploader
from fastapi import HTTPException, UploadFile
from app.config import settings

cloudinary.config(
    cloud_name=settings.CLOUDINARY_CLOUD_NAME,
    api_key=settings.CLOUDINARY_API_KEY,
    api_secret=settings.CLOUDINARY_API_SECRET
)

ALLOWED_TYPES = ["image/jpeg", "image/png"]
MAX_SIZE = 2 * 1024 * 1024  # 2MB

async def upload_image(image: UploadFile) -> str:
    if image.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Only JPG and PNG allowed")

    contents = await image.read()

    if len(contents) > MAX_SIZE:
        raise HTTPException(status_code=400, detail="Image must be under 2MB")

    result = cloudinary.uploader.upload(
        contents,
        folder="social_feed",
        resource_type="image"
    )
    return result["secure_url"]

async def delete_image(public_id: str):
    cloudinary.uploader.destroy(public_id)