import os
from pathlib import Path
import firebase_admin
from firebase_admin import credentials, firestore, auth

# Base backend directory
BASE_DIR = Path(__file__).resolve().parent.parent.parent

# Attempt loading environment variables from .env
try:
    from dotenv import load_dotenv
    load_dotenv(BASE_DIR / ".env")
except ImportError:
    pass

DEFAULT_KEY_PATH = BASE_DIR / "serviceAccountKey.json"
FALLBACK_KEY_PATH = BASE_DIR / "serviceAccountKey.json.json"

SERVICE_ACCOUNT_KEY_PATH = os.getenv("FIREBASE_CREDENTIALS_PATH")
if not SERVICE_ACCOUNT_KEY_PATH or not Path(SERVICE_ACCOUNT_KEY_PATH).exists():
    if DEFAULT_KEY_PATH.exists():
        SERVICE_ACCOUNT_KEY_PATH = str(DEFAULT_KEY_PATH)
    elif FALLBACK_KEY_PATH.exists():
        SERVICE_ACCOUNT_KEY_PATH = str(FALLBACK_KEY_PATH)
    else:
        SERVICE_ACCOUNT_KEY_PATH = str(DEFAULT_KEY_PATH)

firebase_app = None

# Initialize Firebase Admin app safely
if not firebase_admin._apps:
    if Path(SERVICE_ACCOUNT_KEY_PATH).exists():
        try:
            cred = credentials.Certificate(SERVICE_ACCOUNT_KEY_PATH)
            firebase_app = firebase_admin.initialize_app(cred)
            print(f"[Firebase Admin] Initialized successfully with: {SERVICE_ACCOUNT_KEY_PATH}")
        except Exception as e:
            print(f"[Firebase Admin] Error initializing with certificate {SERVICE_ACCOUNT_KEY_PATH}: {e}")
    else:
        print(f"[Firebase Admin] Warning: Certificate file not found at {SERVICE_ACCOUNT_KEY_PATH}")
        try:
            firebase_app = firebase_admin.initialize_app()
            print("[Firebase Admin] Initialized with application default credentials.")
        except Exception as e:
            print(f"[Firebase Admin] Initialization failed: {e}")
else:
    firebase_app = firebase_admin.get_app()

# Firestore client
try:
    db = firestore.client() if firebase_admin._apps else None
except Exception as e:
    print(f"[Firestore] Initialization error: {e}")
    db = None

# Firebase Auth module export
firebase_auth = auth
