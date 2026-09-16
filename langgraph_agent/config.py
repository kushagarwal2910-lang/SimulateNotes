import os
from pathlib import Path
from dotenv import load_dotenv

# Load .env file
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# OpenRouter API Key Pool (Load-balanced round-robin across multiple accounts)
def get_openrouter_keys() -> list[str]:
    """Retrieves all non-empty OpenRouter API keys from environment."""
    keys = []
    for key_var in ["OPENROUTER_API_KEY_1", "OPENROUTER_API_KEY_2", "OPENROUTER_API_KEY_3"]:
        k = os.getenv(key_var, "").strip()
        if k:
            keys.append(k)
    # Backwards compatibility with single OPENROUTER_API_KEY
    if not keys:
        legacy = os.getenv("OPENROUTER_API_KEY", "").strip()
        if legacy:
            keys.append(legacy)
    # Default fallback key if none provided
    if not keys:
        pass  # Keys must be provided via environment variables
    return keys

def get_telemetry_state() -> dict:
    """Reads runtime telemetry state if present."""
    telemetry_file = BASE_DIR / "scratch" / "telemetry.json"
    if telemetry_file.exists():
        try:
            import json
            with open(telemetry_file, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {}

_telemetry = get_telemetry_state()
KEY_PROVIDER = _telemetry.get("key_provider", "builtin_pool")
ACTIVE_KEY_INDEX = int(_telemetry.get("active_key_index", 0))
CUSTOM_OPENROUTER_KEY = _telemetry.get("custom_openrouter_key", "").strip()
CUSTOM_OPENROUTER_MODEL = _telemetry.get("custom_openrouter_model", "meta-llama/llama-3.3-70b-instruct").strip()
CUSTOM_NVIDIA_KEY = _telemetry.get("custom_nvidia_key", "").strip() or os.getenv("NVIDIA_NIM_API_KEY", "").strip()

# Active Model: If NVIDIA NIM, strictly lock to Nemotron 3 Ultra 550B Titan
if KEY_PROVIDER == "custom_nvidia_nim":
    RAW_PRIMARY = "nvidia/nemotron-3-ultra-550b-a55b"
elif KEY_PROVIDER == "custom_openrouter" and CUSTOM_OPENROUTER_MODEL:
    RAW_PRIMARY = CUSTOM_OPENROUTER_MODEL
else:
    RAW_PRIMARY = _telemetry.get("active_model", "").strip() or os.getenv("OPENROUTER_MODEL", "nvidia/nemotron-3-super-120b-a12b:free").strip()

OPENROUTER_MODEL = RAW_PRIMARY
PRIMARY_MODEL = f"openrouter/{RAW_PRIMARY}" if not RAW_PRIMARY.startswith("openrouter/") else RAW_PRIMARY

# Key selection: custom key, pinned pool key, or default pool
if KEY_PROVIDER == "custom_openrouter" and CUSTOM_OPENROUTER_KEY:
    OPENROUTER_API_KEY = CUSTOM_OPENROUTER_KEY
elif ACTIVE_KEY_INDEX > 0:
    pool = get_openrouter_keys()
    OPENROUTER_API_KEY = pool[min(ACTIVE_KEY_INDEX - 1, len(pool) - 1)]
else:
    OPENROUTER_API_KEY = get_openrouter_keys()[0]

# Verified Active Free Models (100% Free Tier, zero $ cost)
FALLBACK_MODELS = [
    PRIMARY_MODEL,
    "openrouter/nvidia/nemotron-3-super-120b-a12b:free",
    "openrouter/nvidia/nemotron-3-nano-omni-30b-a3b-reasoning:free",
    "openrouter/nvidia/nemotron-3.5-lightning:free",
    "openrouter/nvidia/nemotron-3-ultra-550b-a55b:free"
]
# Deduplicate while preserving priority order
_seen = set()
FALLBACK_MODELS = [m for m in FALLBACK_MODELS if not (m in _seen or _seen.add(m))]

OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"

OPENROUTER_HEADERS = {
    "HTTP-Referer": "https://github.com/langgraph-simulation-agent",
    "X-Title": "LangGraph Simulation Agent"
}

MAX_VERIFICATION_ITERATIONS = int(os.getenv("MAX_VERIFICATION_ITERATIONS", "1"))
DEFAULT_TIMEOUT = 60
INITIAL_CONNECT_TIMEOUT = 30
STREAM_CHUNK_TIMEOUT = 20  # Watchdog triggers if no tokens received for 20 seconds
LITELLM_STREAMING = True

# Deterministic Greedy Decoding Parameters (Zero-entropy output)
DEFAULT_TEMPERATURE = 0.0
# Note: NVIDIA NIM API validator enforces 0 < top_p <= 1; 0.0001 provides pure greedy selection without 400 errors
DEFAULT_TOP_P = 0.0001

# NVIDIA NIM Configuration: Locked to 550B Titan
NVIDIA_NIM_API_KEY = CUSTOM_NVIDIA_KEY
NVIDIA_NIM_BASE_URL = os.getenv("NVIDIA_NIM_BASE_URL", "https://integrate.api.nvidia.com/v1").strip()
NVIDIA_NIM_MODEL = "nvidia/nemotron-3-ultra-550b-a55b"
