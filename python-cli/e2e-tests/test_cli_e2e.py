"""End-to-end tests for full CLI execution in isolated environments."""

import os
import subprocess
import sys
import tempfile
from pathlib import Path


class TestCLIInIsolatedEnvironment:
    """Test CLI functionality in isolated environments."""

    def setup_method(self):
        """Set up a temporary directory for isolated testing."""
        self.temp_dir = tempfile.mkdtemp()
        self.original_cwd = os.getcwd()

    def teardown_method(self):
        """Clean up temporary directory."""
        os.chdir(self.original_cwd)
        # Note: temp directory cleanup would happen automatically

    def run_cli_from_template(self, args: list[str]) -> tuple[int, str, str]:
        """Run the CLI from the current directory."""
        cmd = [sys.executable, "-m", "python_cli.cli"] + args

        # Add src to Python path
        env = os.environ.copy()
        env["PYTHONPATH"] = str(Path("src").resolve()) + ":" + env.get("PYTHONPATH", "")

        result = subprocess.run(cmd, capture_output=True, text=True, env=env)
        return result.returncode, result.stdout, result.stderr

    def test_hello_world_e2e(self):
        """Test complete hello world flow."""
        exit_code, stdout, stderr = self.run_cli_from_template(["hello"])
        assert exit_code == 0
        assert "hello world from Python CLI!" in stdout
        assert stderr == ""

    def test_complete_workflow_e2e(self):
        """Test complete CLI workflow."""
        # Test version
        exit_code, stdout, stderr = self.run_cli_from_template(["version"])
        assert exit_code == 0
        assert "python-cli version 0.1.0" in stdout

        # Test hello with name
        exit_code, stdout, stderr = self.run_cli_from_template(["hello", "--name", "TestUser"])
        assert exit_code == 0
        assert "hello world from Python CLI, TestUser!" in stdout

        # Test process with uppercase
        exit_code, stdout, stderr = self.run_cli_from_template(["process", "Test Input", "-u"])
        assert exit_code == 0
        assert "PROCESSED: TEST INPUT" in stdout

        # Test process without input (should use default greeting)
        exit_code, stdout, stderr = self.run_cli_from_template(["process"])
        assert exit_code == 0
        assert "hello world from Python CLI!" in stdout

    def test_error_handling_e2e(self):
        """Test error handling in isolated environment."""
        # Test invalid command
        exit_code, stdout, stderr = self.run_cli_from_template(["invalid-command"])
        assert exit_code != 0
        # Should show error message or help

    def test_cli_with_piped_input_simulation(self):
        """Test CLI behavior that might come from piped input."""
        # This simulates what would happen with piped input
        # In a real scenario, you might modify the CLI to accept stdin
        test_inputs = [
            "Simple text",
            "  Text with spaces  ",
            "",
            "Special chars: !@#$%^&*()",
        ]

        for input_text in test_inputs:
            exit_code, stdout, stderr = self.run_cli_from_template(["process", input_text])
            assert exit_code == 0
            assert stderr == ""
            if input_text.strip():
                assert f"Processed: {input_text.strip()}" in stdout
            else:
                assert "hello world from Python CLI!" in stdout

    def test_cli_help_system_e2e(self):
        """Test the complete help system."""
        # Test main help
        exit_code, stdout, stderr = self.run_cli_from_template(["--help"])
        assert exit_code == 0
        assert "Usage:" in stdout
        assert "Commands:" in stdout
        assert "hello" in stdout
        assert "process" in stdout
        assert "version" in stdout

        # Test subcommand helps
        for command in ["hello", "process", "version"]:
            exit_code, stdout, stderr = self.run_cli_from_template([command, "--help"])
            assert exit_code == 0
            assert "Usage:" in stdout

    def test_cli_performance_e2e(self):
        """Test CLI performance in isolated environment."""
        import time

        # Measure response time for basic commands
        start_time = time.time()
        exit_code, stdout, stderr = self.run_cli_from_template(["hello"])
        end_time = time.time()

        assert exit_code == 0
        # Command should complete within reasonable time (2 seconds)
        assert (end_time - start_time) < 2.0
