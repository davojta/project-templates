"""Environment variable utilities for the geo-cli."""

import os
from pathlib import Path
from typing import Optional
from dotenv import load_dotenv


def load_env(env_file: Optional[str] = None) -> None:
    """Load environment variables from .env file.

    Args:
        env_file: Path to .env file. If None, will look for .env in current directory
                 and parent directories.
    """
    if env_file:
        load_dotenv(env_file)
    else:
        # Look for .env in current directory and parent directories
        load_dotenv()


def get_mapbox_token() -> Optional[str]:
    """Get Mapbox access token from environment variables.

    Returns:
        Mapbox access token if found, None otherwise.
    """
    return os.getenv("MAPBOX_ACCESS_TOKEN")


def get_cache_dir() -> Path:
    """Get cache directory from environment variables.

    Returns:
        Path to cache directory. Defaults to ./data/cache if not set.
    """
    cache_dir = os.getenv("GEO_CLI_CACHE_DIR")
    if cache_dir:
        return Path(cache_dir)
    return Path("data/cache")


def get_log_level() -> str:
    """Get log level from environment variables.

    Returns:
        Log level string. Defaults to "INFO" if not set.
    """
    return os.getenv("GEO_CLI_LOG_LEVEL", "INFO")


def get_max_memory_gb() -> int:
    """Get maximum memory limit in GB from environment variables.

    Returns:
        Memory limit in GB. Defaults to 8 if not set.
    """
    try:
        return int(os.getenv("GEO_CLI_MAX_MEMORY_GB", "8"))
    except ValueError:
        return 8