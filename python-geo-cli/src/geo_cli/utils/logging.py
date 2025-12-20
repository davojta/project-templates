"""Logging utilities for the geospatial CLI."""

import logging
import logging.handlers
import sys
from pathlib import Path
from typing import Optional

from rich.console import Console
from rich.logging import RichHandler

console = Console()


def setup_logging(
    level: str = "INFO",
    log_file: Optional[Path] = None,
    max_file_size_mb: int = 10,
    backup_count: int = 5,
    format_string: Optional[str] = None
) -> None:
    """Set up logging configuration with rich formatting.

    Args:
        level: Logging level (DEBUG, INFO, WARNING, ERROR, CRITICAL)
        log_file: Optional log file path
        max_file_size_mb: Maximum log file size before rotation
        backup_count: Number of backup log files to keep
        format_string: Custom log format string
    """
    # Clear any existing handlers
    root_logger = logging.getLogger()
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)

    # Set log level
    log_level = getattr(logging, level.upper(), logging.INFO)

    # Default format
    if format_string is None:
        format_string = "%(message)s"

    # Rich handler for console output
    console_handler = RichHandler(
        console=console,
        show_time=True,
        show_path=True,
        markup=True,
        rich_tracebacks=True,
        tracebacks_show_locals=True
    )
    console_handler.setFormatter(logging.Formatter(format_string))
    console_handler.setLevel(log_level)

    # Add console handler
    root_logger.addHandler(console_handler)

    # File handler if log file is specified
    if log_file:
        log_file.parent.mkdir(parents=True, exist_ok=True)

        file_format_string = (
            "%(asctime)s - %(name)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s"
        )
        file_handler = logging.handlers.RotatingFileHandler(
            log_file,
            maxBytes=max_file_size_mb * 1024 * 1024,
            backupCount=backup_count,
            encoding='utf-8'
        )
        file_handler.setFormatter(logging.Formatter(file_format_string))
        file_handler.setLevel(log_level)
        root_logger.addHandler(file_handler)

    # Set root logger level
    root_logger.setLevel(log_level)

    # Log initialization
    logger = logging.getLogger(__name__)
    logger.info(f"Logging initialized at level: {level}")
    if log_file:
        logger.info(f"Log file: {log_file}")


def get_logger(name: str) -> logging.Logger:
    """Get a logger instance with the specified name.

    Args:
        name: Logger name (usually __name__)

    Returns:
        Configured logger instance
    """
    return logging.getLogger(name)


class SpatialLoggerAdapter(logging.LoggerAdapter):
    """Logger adapter that adds spatial context information."""

    def __init__(self, logger: logging.Logger, extra: Optional[dict] = None):
        """Initialize the spatial logger adapter."""
        super().__init__(logger, extra or {})

    def process(self, msg, kwargs):
        """Process log message to add spatial context."""
        if self.extra:
            spatial_info = []
            if 'bbox' in self.extra:
                spatial_info.append(f"bbox={self.extra['bbox']}")
            if 'crs' in self.extra:
                spatial_info.append(f"crs={self.extra['crs']}")
            if 'feature_count' in self.extra:
                spatial_info.append(f"features={self.extra['feature_count']}")

            if spatial_info:
                msg = f"[{', '.join(spatial_info)}] {msg}"

        return msg, kwargs


def log_spatial_operation(
    operation: str,
    bbox: Optional[tuple] = None,
    crs: Optional[str] = None,
    feature_count: Optional[int] = None,
    logger_name: str = "geo_cli"
) -> SpatialLoggerAdapter:
    """Create a logger adapter with spatial context.

    Args:
        operation: Name of the spatial operation
        bbox: Bounding box coordinates
        crs: Coordinate reference system
        feature_count: Number of features being processed
        logger_name: Base logger name

    Returns:
        SpatialLoggerAdapter with context information
    """
    extra = {
        'operation': operation
    }

    if bbox:
        extra['bbox'] = f"{bbox[0]:.3f},{bbox[1]:.3f},{bbox[2]:.3f},{bbox[3]:.3f}"
    if crs:
        extra['crs'] = crs
    if feature_count is not None:
        extra['feature_count'] = f"{feature_count:,}"

    logger = get_logger(logger_name)
    return SpatialLoggerAdapter(logger, extra)


def log_performance(func):
    """Decorator to log function performance metrics."""
    import time
    import functools

    @functools.wraps(func)
    def wrapper(*args, **kwargs):
        logger = get_logger(func.__module__)
        start_time = time.time()

        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            logger.info(f"{func.__name__} completed in {execution_time:.2f}s")
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"{func.__name__} failed after {execution_time:.2f}s: {e}")
            raise

    return wrapper


class ProgressLogger:
    """Logger for long-running operations with progress tracking."""

    def __init__(
        self,
        operation: str,
        total_steps: int,
        logger_name: str = "geo_cli"
    ):
        """Initialize progress logger.

        Args:
            operation: Description of the operation
            total_steps: Total number of steps in the operation
            logger_name: Logger name to use
        """
        self.operation = operation
        self.total_steps = total_steps
        self.current_step = 0
        self.logger = get_logger(logger_name)

    def step(self, description: str = "") -> None:
        """Log progress for a single step."""
        self.current_step += 1
        progress = (self.current_step / self.total_steps) * 100
        status = f"{self.operation}: {self.current_step}/{self.total_steps} ({progress:.1f}%)"

        if description:
            status += f" - {description}"

        self.logger.info(status)

    def finish(self, message: str = "completed") -> None:
        """Log completion of the operation."""
        self.logger.info(f"{self.operation}: {message}")


# Convenience function for quick setup
def configure_basic_logging(level: str = "INFO", log_file: Optional[Path] = None):
    """Configure basic logging with sensible defaults.

    Args:
        level: Log level
        log_file: Optional log file path
    """
    setup_logging(
        level=level,
        log_file=log_file,
        format_string="%(message)s"
    )