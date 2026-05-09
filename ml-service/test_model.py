"""
Standalone YOLOv8 model debugging script for CityZen.

Run with:
    python test_model.py
"""

from pathlib import Path

from ultralytics import YOLO


MODEL_PATH = Path("app/models/best.pt")
IMAGE_PATH = Path("test.jpg")
CONFIDENCE_THRESHOLD = 0.2


def main():
    if not MODEL_PATH.exists():
        print(f"MODEL FILE NOT FOUND: {MODEL_PATH}")
        return

    if not IMAGE_PATH.exists():
        print(f"TEST IMAGE NOT FOUND: {IMAGE_PATH}")
        return

    model = YOLO(str(MODEL_PATH))
    print(f"MODEL NAMES: {getattr(model, 'names', {})}")

    results = model(str(IMAGE_PATH), conf=CONFIDENCE_THRESHOLD, verbose=False)

    print(f"RAW RESULTS: {results}")

    if results is None:
        print("RESULT COUNT: None")
        print("NO BOXES DETECTED")
        return

    try:
        result_count = len(results)
    except TypeError:
        result_count = None

    print(f"RESULT COUNT: {result_count}")

    if not results or result_count == 0:
        print("NO BOXES DETECTED")
        return

    first_result = results[0]
    boxes = getattr(first_result, "boxes", None)
    print(f"RESULTS[0].BOXES: {boxes}")

    if boxes is None:
        print("BOX COUNT: 0")
        print("NO BOXES DETECTED")
        return

    try:
        box_count = len(boxes)
    except TypeError:
        box_count = 0

    print(f"BOX COUNT: {box_count}")

    if box_count == 0:
        print("NO BOXES DETECTED")
        return

    class_ids = _tensor_to_list(getattr(boxes, "cls", None))
    confidences = _tensor_to_list(getattr(boxes, "conf", None))
    coordinates = _tensor_to_list(getattr(boxes, "xyxy", None))
    result_names = getattr(first_result, "names", {}) or {}

    print(f"CLASS IDS: {class_ids}")
    print(f"CONFIDENCE SCORES: {confidences}")
    print(f"XYXY COORDINATES: {coordinates}")

    for index in range(box_count):
        class_id_value = class_ids[index] if index < len(class_ids) else None
        confidence_value = confidences[index] if index < len(confidences) else None

        try:
            class_id = int(class_id_value)
        except (TypeError, ValueError):
            class_id = None

        label = _resolve_label(result_names, class_id)

        print()
        print(f"DETECTION {index + 1}")
        print(f"CLASS ID: {class_id}")
        print(f"LABEL: {label}")
        print(f"CONFIDENCE: {confidence_value}")


def _tensor_to_list(tensor_like):
    if tensor_like is None:
        return []

    try:
        values = tensor_like.tolist()
    except AttributeError:
        return []

    if isinstance(values, list):
        return values

    return [values]


def _resolve_label(names, class_id):
    if class_id is None:
        return None
    if isinstance(names, dict):
        return names.get(class_id)
    if isinstance(names, list) and 0 <= class_id < len(names):
        return names[class_id]
    return None


if __name__ == "__main__":
    main()
