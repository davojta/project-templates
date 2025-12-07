"""Pydantic models for type safety and validation."""

from pydantic import BaseModel, Field


class Message(BaseModel):
    """A message model with type-safe validation."""

    content: str = Field(..., description="The message content")
    recipient: str | None = Field(None, description="The message recipient")

    def greet(self) -> str:
        """Generate a greeting message."""
        base_msg = f"hello world{self.content}"
        if self.recipient:
            return f"{base_msg}, {self.recipient}!"
        return f"{base_msg}!"
