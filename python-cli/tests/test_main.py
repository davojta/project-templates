"""Unit tests for the main module."""

from python_cli.main import create_greeting, process_input
from python_cli.models import Message


class TestMessage:
    """Test the Message model."""

    def test_message_creation_with_recipient(self):
        """Test creating a message with a recipient."""
        message = Message(content=" test", recipient="Alice")
        assert message.content == " test"
        assert message.recipient == "Alice"

    def test_message_creation_without_recipient(self):
        """Test creating a message without a recipient."""
        message = Message(content=" from Python CLI")
        assert message.content == " from Python CLI"
        assert message.recipient is None

    def test_greet_with_recipient(self):
        """Test greeting with a recipient."""
        message = Message(content=" from Python CLI", recipient="Alice")
        result = message.greet()
        assert result == "hello world from Python CLI, Alice!"

    def test_greet_without_recipient(self):
        """Test greeting without a recipient."""
        message = Message(content=" from Python CLI")
        result = message.greet()
        assert result == "hello world from Python CLI!"


class TestCreateGreeting:
    """Test the create_greeting function."""

    def test_create_greeting_without_name(self):
        """Test creating a greeting without a name."""
        result = create_greeting()
        assert result == "hello world from Python CLI!"

    def test_create_greeting_with_name(self):
        """Test creating a greeting with a name."""
        result = create_greeting("Alice")
        assert result == "hello world from Python CLI, Alice!"


class TestProcessInput:
    """Test the process_input function."""

    def test_process_empty_input(self):
        """Test processing empty input."""
        result = process_input("")
        assert result == "hello world from Python CLI!"

    def test_process_whitespace_input(self):
        """Test processing whitespace-only input."""
        result = process_input("   ")
        assert result == "hello world from Python CLI!"

    def test_process_normal_input(self):
        """Test processing normal input."""
        result = process_input("Hello there")
        assert result == "Processed: Hello there"

    def test_process_input_with_leading_trailing_spaces(self):
        """Test processing input with leading/trailing spaces."""
        result = process_input("  Hello there  ")
        assert result == "Processed: Hello there"
