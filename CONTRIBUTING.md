# Contributing to `create-agency-app`

Thank you for your interest in contributing!

This project consists of two main parts:
1. **The CLI**: Written in Go using Bubble Tea.
2. **The Template**: A Next.js App Router project located in the `template/` directory.

## Modifying the Next.js Template
You don't need to know Go to contribute to the template!
1. Navigate to the template folder:
   ```bash
   cd template
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Run the development server to test your changes:
   ```bash
   npm run dev
   ```
4. Once you are happy with your changes, commit them. The Go CLI will automatically bundle the updated `template/` directory using `go:embed` the next time you build the CLI.

## Modifying the Go CLI
1. Ensure you have Go 1.21+ installed.
2. Make your changes in `main.go` or `upgrade.go`.
3. Build the CLI:
   ```bash
   go build -o create-agency-app
   ```
