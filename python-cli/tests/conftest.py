"""Pytest configuration and fixtures."""

from unittest.mock import Mock

import pytest


@pytest.fixture
def mock_click_context():
    """Create a mock Click context for testing CLI commands."""
    context = Mock()
    context.obj = {}
    return context
