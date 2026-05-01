.PHONY: run-main build run-test run-integration-tests run-e2e-tests run-all-tests run-lint run-format check

run-main:
	go run .

build:
	go build -o bin/go-cli .

run-test:
	go test ./internal/... -v -cover

run-integration-tests:
	go test ./integration-tests/... -v

run-e2e-tests:
	go build -o bin/go-cli . && go test ./e2e-tests/... -v

run-all-tests: run-test run-integration-tests run-e2e-tests

run-lint:
	golangci-lint run ./...

run-format:
	gofmt -w .

check:
	golangci-lint run ./...
	@test -z "$$(gofmt -l .)" || (echo "Format issues found. Run 'make run-format'." && exit 1)
