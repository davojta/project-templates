package e2e_test

import (
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"testing"
)

var binaryPath string

func TestMain(m *testing.M) {
	tmp, err := os.MkdirTemp("", "go-cli-e2e-*")
	if err != nil {
		panic(err)
	}
	defer func() { _ = os.RemoveAll(tmp) }()

	binaryPath = filepath.Join(tmp, "go-cli")
	build := exec.Command("go", "build", "-o", binaryPath, ".")
	build.Dir = ".."
	if out, err := build.CombinedOutput(); err != nil {
		panic("build failed: " + string(out))
	}

	os.Exit(m.Run())
}

func TestE2EDefaultGreeting(t *testing.T) {
	out, err := exec.Command(binaryPath).Output()
	if err != nil {
		t.Fatalf("command failed: %v", err)
	}

	got := strings.TrimSpace(string(out))
	if got != "Hello, World!" {
		t.Errorf("got %q, want %q", got, "Hello, World!")
	}
}

func TestE2ECustomName(t *testing.T) {
	out, err := exec.Command(binaryPath, "--name", "Alice").Output()
	if err != nil {
		t.Fatalf("command failed: %v", err)
	}

	got := strings.TrimSpace(string(out))
	if got != "Hello, Alice!" {
		t.Errorf("got %q, want %q", got, "Hello, Alice!")
	}
}

func TestE2EHelpFlag(t *testing.T) {
	out, err := exec.Command(binaryPath, "--help").Output()
	if err != nil {
		t.Fatalf("command failed: %v", err)
	}

	if !strings.Contains(string(out), "--name") {
		t.Errorf("help output missing --name flag, got: %s", out)
	}
}
