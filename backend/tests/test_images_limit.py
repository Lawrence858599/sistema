from __future__ import annotations

from app.routes import tasks as tasks_routes


def test_validate_images_max_limit() -> None:
    images = [
        {
            "fileName": f"f{i}.png",
            "mimeType": "image/png",
            "sizeBytes": 1,
            "imageData": "data:image/png;base64,AA==",
        }
        for i in range(tasks_routes.MAX_IMAGES + 1)
    ]
    msg = tasks_routes._validate_images(images)
    assert msg is not None
