package integration_test

import (
	"bytes"
	"strings"
	"testing"

	"github.com/example/go-cli/cmd"
)

func TestCLIDefaultGreeting(t *testing.T) {
	buf := &bytes.Buffer{}
	root := cmd.NewRootCmd()
	root.SetOut(buf)
	root.SetArgs([]string{})

	if err := root.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := strings.TrimSpace(buf.String())
	if got != "Hello, World!" {
		t.Errorf("got %q, want %q", got, "Hello, World!")
	}
}

func TestCLICustomName(t *testing.T) {
	buf := &bytes.Buffer{}
	root := cmd.NewRootCmd()
	root.SetOut(buf)
	root.SetArgs([]string{"--name", "Alice"})

	if err := root.Execute(); err != nil {
		t.Fatalf("unexpected error: %v", err)
	}

	got := strings.TrimSpace(buf.String())
	if got != "Hello, Alice!" {
		t.Errorf("got %q, want %q", got, "Hello, Alice!")
	}
}

func TestCLIHelpFlag(t *testing.T) {
	buf := &bytes.Buffer{}
	root := cmd.NewRootCmd()
	root.SetOut(buf)
	root.SetArgs([]string{"--help"})

	// --help exits 0 but cobra returns nil
	_ = root.Execute()

	if !strings.Contains(buf.String(), "--name") {
		t.Errorf("help output missing --name flag, got: %s", buf.String())
	}
}
