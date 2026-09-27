import uvicorn
import os
import sys

# Ensure backend directory is in python module search path
backend_dir = os.path.dirname(os.path.abspath(__file__))
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    is_dev = os.getenv("ENVIRONMENT", "development").lower() == "development"
    reload_opt = os.getenv("RELOAD", "true" if is_dev else "false").lower() == "true"
    print(f"Starting AIVOA QMS on http://0.0.0.0:{port} (reload={reload_opt})")
    uvicorn.run("app.main:app", host="0.0.0.0", port=port, reload=reload_opt, app_dir=backend_dir)

