package cmd

import (
	"fmt"
	"os"

	"github.com/example/go-cli/internal/greeting"
	"github.com/spf13/cobra"
)

func NewRootCmd() *cobra.Command {
	var name string

	cmd := &cobra.Command{
		Use:   "go-cli",
		Short: "A simple CLI greeting application",
		Run: func(c *cobra.Command, args []string) {
			_, _ = fmt.Fprintln(c.OutOrStdout(), greeting.Greet(name))
		},
	}

	cmd.Flags().StringVar(&name, "name", "World", "Name to greet")
	return cmd
}

func Execute() {
	if err := NewRootCmd().Execute(); err != nil {
		fmt.Fprintln(os.Stderr, err)
		os.Exit(1)
	}
}
