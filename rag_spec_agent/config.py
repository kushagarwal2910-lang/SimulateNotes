import os
from pathlib import Path
from dotenv import load_dotenv

# Load root .env
load_dotenv()

BASE_DIR = Path(__file__).resolve().parent.parent

# Tavily API Configuration
TAVILY_API_KEY = os.getenv("TAVILY_API_KEY", "").strip()

# Document Count Boundaries (Strict 25-30 requirement)
MIN_DOCUMENTS = 25
TARGET_DOCUMENTS = 28
MAX_DOCUMENTS = 32

# OpenRouter High-Context Model Configuration
# Gemini 2.0 Flash (1M tokens context) or Claude 3.5 Sonnet (200k tokens context)
DEFAULT_SPEC_MODEL = "google/gemini-2.0-flash-001"
RAG_SPEC_MODEL = os.getenv("RAG_SPEC_MODEL", DEFAULT_SPEC_MODEL).strip()
if not RAG_SPEC_MODEL.startswith("openrouter/"):
    RAG_SPEC_MODEL_FULL = f"openrouter/{RAG_SPEC_MODEL}"
else:
    RAG_SPEC_MODEL_FULL = RAG_SPEC_MODEL

SPEC_FALLBACK_MODELS = [
    "openrouter/google/gemini-2.0-flash-001",
    "openrouter/anthropic/claude-3.5-sonnet",
    "openrouter/meta-llama/llama-3.3-70b-instruct",
    "openrouter/nvidia/nemotron-3-super-120b-a12b:free",
    "openrouter/nvidia/nemotron-3-ultra-550b-a55b:free"
]

# OpenRouter API Key Pool
def get_openrouter_keys() -> list[str]:
    """Retrieves all non-empty OpenRouter API keys from environment."""
    keys = []
    for key_var in ["OPENROUTER_API_KEY_1", "OPENROUTER_API_KEY_2", "OPENROUTER_API_KEY_3"]:
        k = os.getenv(key_var, "").strip()
        if k:
            keys.append(k)
    if not keys:
        legacy = os.getenv("OPENROUTER_API_KEY", "").strip()
        if legacy:
            keys.append(legacy)
    if not keys:
        # Default fallback key configured in project
        pass  # Keys must be provided via environment variables
    return keys

# RAG & Embeddings Storage Configuration
RAG_CACHE_DIR = BASE_DIR / "scratch" / "rag_db"
RAG_CACHE_DIR.mkdir(parents=True, exist_ok=True)

SAMPLES_DIR = BASE_DIR / "samples"
SAMPLES_DIR.mkdir(parents=True, exist_ok=True)

CHUNK_SIZE = 850
CHUNK_OVERLAP = 150
TOP_K_RETRIEVAL = 16

# Embedding Model
EMBEDDING_MODEL_NAME = "all-MiniLM-L6-v2"
