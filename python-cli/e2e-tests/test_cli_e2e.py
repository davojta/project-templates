"""End-to-end smoke tests: run the CLI as a real subprocess.

Keep this layer small: one check per command/option that proves the wiring works.
Business logic edge cases belong in unit tests (tests/).
"""

import os
import subprocess
import sys
from pathlib import Path

import pytest

SRC_DIR = Path(__file__).resolve().parent.parent / "src"


def run_cli(*args: str) -> subprocess.CompletedProcess[str]:
    """Run `python -m python_cli.cli` with the given arguments."""
    env = os.environ.copy()
    env["PYTHONPATH"] = os.pathsep.join(filter(None, [str(SRC_DIR), env.get("PYTHONPATH")]))
    return subprocess.run(
        [sys.executable, "-m", "python_cli.cli", *args],
        capture_output=True,
        text=True,
        env=env,
        check=False,
    )


@pytest.mark.parametrize(
    ("args", "expected"),
    [
        (["hello"], "hello world from Python CLI!"),
        (["hello", "--name", "Alice"], "hello world from Python CLI, Alice!"),
        (["hello", "-n", "Bob"], "hello world from Python CLI, Bob!"),
        (["process"], "hello world from Python CLI!"),
        (["process", "Hello there"], "Processed: Hello there"),
        (["process", "Hello there", "--uppercase"], "PROCESSED: HELLO THERE"),
        (["process", "Hello there", "-u"], "PROCESSED: HELLO THERE"),
        (["version"], "python-cli version 0.1.0"),
        (["--version"], "python-cli, version 0.1.0"),
    ],
)
def test_command_output(args: list[str], expected: str) -> None:
    result = run_cli(*args)
    assert result.returncode == 0
    assert expected in result.stdout
    assert result.stderr == ""


def test_help_lists_commands() -> None:
    result = run_cli("--help")
    assert result.returncode == 0
    for command in ["hello", "process", "version"]:
        assert command in result.stdout


@pytest.mark.parametrize("command", ["hello", "process", "version"])
def test_command_help(command: str) -> None:
    result = run_cli(command, "--help")
    assert result.returncode == 0
    assert "Usage:" in result.stdout


def test_unknown_command_fails() -> None:
    result = run_cli("invalid-command")
    assert result.returncode != 0
