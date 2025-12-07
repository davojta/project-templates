"""Main business logic for the Python CLI application."""

from python_cli.models import Message


def create_greeting(name: str | None = None) -> str:
    """Create a greeting message.

    Args:
        name: Optional name to include in the greeting.

    Returns:
        A greeting string.
    """
    message = Message(content=" from Python CLI", recipient=name)
    return message.greet()


def process_input(input_text: str) -> str:
    """Process input text and return a formatted response.

    Args:
        input_text: The input text to process.

    Returns:
        Formatted response string.
    """
    if not input_text.strip():
        return create_greeting()

    return f"Processed: {input_text.strip()}"
