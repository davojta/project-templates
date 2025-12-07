"""Integration tests for CLI commands."""

import subprocess
import sys


def run_cli_command(args: list[str]) -> tuple[int, str, str]:
    """Run the CLI command and return exit code, stdout, and stderr."""
    cmd = [sys.executable, "-m", "python_cli.cli"] + args
    result = subprocess.run(cmd, capture_output=True, text=True, cwd=".")
    return result.returncode, result.stdout, result.stderr


class TestHelloCommand:
    """Test the hello command."""

    def test_hello_without_name(self):
        """Test hello command without a name."""
        exit_code, stdout, stderr = run_cli_command(["hello"])
        assert exit_code == 0
        assert "hello world from Python CLI!" in stdout
        assert stderr == ""

    def test_hello_with_name(self):
        """Test hello command with a name."""
        exit_code, stdout, stderr = run_cli_command(["hello", "--name", "Alice"])
        assert exit_code == 0
        assert "hello world from Python CLI, Alice!" in stdout
        assert stderr == ""

    def test_hello_with_short_name_flag(self):
        """Test hello command with short name flag."""
        exit_code, stdout, stderr = run_cli_command(["hello", "-n", "Bob"])
        assert exit_code == 0
        assert "hello world from Python CLI, Bob!" in stdout
        assert stderr == ""


class TestProcessCommand:
    """Test the process command."""

    def test_process_without_argument(self):
        """Test process command without argument."""
        exit_code, stdout, stderr = run_cli_command(["process"])
        assert exit_code == 0
        assert "hello world from Python CLI!" in stdout
        assert stderr == ""

    def test_process_with_argument(self):
        """Test process command with argument."""
        exit_code, stdout, stderr = run_cli_command(["process", "Hello there"])
        assert exit_code == 0
        assert "Processed: Hello there" in stdout
        assert stderr == ""

    def test_process_with_uppercase_flag(self):
        """Test process command with uppercase flag."""
        exit_code, stdout, stderr = run_cli_command(["process", "Hello there", "--uppercase"])
        assert exit_code == 0
        assert "PROCESSED: HELLO THERE" in stdout
        assert stderr == ""

    def test_process_with_uppercase_short_flag(self):
        """Test process command with short uppercase flag."""
        exit_code, stdout, stderr = run_cli_command(["process", "Hello there", "-u"])
        assert exit_code == 0
        assert "PROCESSED: HELLO THERE" in stdout
        assert stderr == ""


class TestVersionCommand:
    """Test the version command."""

    def test_version(self):
        """Test version command."""
        exit_code, stdout, stderr = run_cli_command(["version"])
        assert exit_code == 0
        assert "python-cli version 0.1.0" in stdout
        assert stderr == ""


class TestHelpCommand:
    """Test help functionality."""

    def test_main_help(self):
        """Test main help command."""
        exit_code, stdout, stderr = run_cli_command(["--help"])
        assert exit_code == 0
        assert "Python CLI Template" in stdout
        assert "hello" in stdout
        assert "process" in stdout
        assert "version" in stdout
        assert stderr == ""

    def test_hello_help(self):
        """Test hello command help."""
        exit_code, stdout, stderr = run_cli_command(["hello", "--help"])
        assert exit_code == 0
        assert "Say hello" in stdout
        assert "--name" in stdout
        assert "-n" in stdout
        assert stderr == ""

    def test_process_help(self):
        """Test process command help."""
        exit_code, stdout, stderr = run_cli_command(["process", "--help"])
        assert exit_code == 0
        assert "Process input text" in stdout
        assert "--uppercase" in stdout
        assert "-u" in stdout
        assert stderr == ""
