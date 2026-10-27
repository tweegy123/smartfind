"""NWU SmartFind backend (Flask). The whole database is one JSON file: database.json.
Item photos are stored inside it as base64 data URLs (items[].img)."""
import json, os, tempfile, threading
from flask import Flask, jsonify, request

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "database.json")
lock = threading.Lock()
app = Flask(__name__, static_folder=os.path.join(HERE, "static"), static_url_path="")


@app.get("/")
def home():
    return app.send_static_file("index.html")


@app.get("/api/state")
def get_state():
    with lock:
        if not os.path.exists(DB):
            return jsonify({})
        with open(DB, encoding="utf-8") as f:
            return app.response_class(f.read(), mimetype="application/json")


@app.put("/api/state")
def put_state():
    data = request.get_json(force=True)
    lines = []
    for key, val in data.items():  # one collection per block, one record per line
        if isinstance(val, list):
            body = "[\n" + ",\n".join("  " + json.dumps(x, ensure_ascii=False) for x in val) + "\n]" if val else "[]"
        else:
            body = json.dumps(val, ensure_ascii=False)
        lines.append(f'"{key}": {body}')
    text = "{\n" + ",\n".join(lines) + "\n}\n"
    with lock:  # write to a temp file, then swap, so a crash never corrupts the database
        fd, tmp = tempfile.mkstemp(dir=HERE, suffix=".tmp")
        with os.fdopen(fd, "w", encoding="utf-8") as f:
            f.write(text)
        os.replace(tmp, DB)
    return jsonify(ok=True)


if __name__ == "__main__":
    app.run(port=5000, debug=True)
