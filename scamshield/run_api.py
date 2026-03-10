"""
Subprocess entry point for ScamShield.
Reads JSON from stdin, runs detection, writes JSON result to stdout.
Called by backend/routers/scamshield.py via subprocess.
"""
import sys
import json

def main():
    try:
        data = json.load(sys.stdin)
    except Exception as e:
        print(json.dumps({"error": f"Invalid input JSON: {e}"}))
        sys.exit(1)

    url = data.get("url", "").strip()
    text = data.get("text") or None

    # Need at least a URL or some text
    if not url and not text:
        print(json.dumps({"error": "Provide a URL or job description text."}))
        sys.exit(1)

    # Use a placeholder URL in text-only mode so domain layers don't crash
    if not url and text:
        url = "http://unknown-listing"

    # Redirect stdout → stderr so debug print()s from feature layers don't
    # corrupt the JSON we write at the end.
    real_stdout = sys.stdout
    sys.stdout = sys.stderr

    try:
        from app import run_detection
        features, result = run_detection(url, manual_text=text)
    except Exception as e:
        sys.stdout = real_stdout
        print(json.dumps({"error": f"Detection failed: {e}"}))
        sys.exit(1)
    finally:
        sys.stdout = real_stdout

    if features is None or result is None:
        print(json.dumps({"error": "Failed to fetch or analyze the listing."}))
        sys.exit(1)

    # Normalize feature values to plain floats for JSON serialisation
    safe_features = {}
    for k, v in features.items():
        try:
            safe_features[k] = float(v)
        except (TypeError, ValueError):
            safe_features[k] = 0.0

    print(json.dumps({"features": safe_features, "result": result}))


if __name__ == "__main__":
    main()
