package greeting_test

import (
	"testing"

	"github.com/example/go-cli/internal/greeting"
)

func TestGreet(t *testing.T) {
	tests := []struct {
		input string
		want  string
	}{
		{"World", "Hello, World!"},
		{"Alice", "Hello, Alice!"},
		{"", "Hello, !"},
	}

	for _, tt := range tests {
		got := greeting.Greet(tt.input)
		if got != tt.want {
			t.Errorf("Greet(%q) = %q, want %q", tt.input, got, tt.want)
		}
	}
}
