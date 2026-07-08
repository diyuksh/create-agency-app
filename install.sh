#!/bin/bash
set -e

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}🚀 Bootstrapping template.sar.ga...${NC}"

# Detect OS
OS="$(uname -s | tr '[:upper:]' '[:lower:]')"
ARCH="$(uname -m)"

# Map architecture names
if [ "$ARCH" = "x86_64" ]; then
    ARCH="amd64"
elif [ "$ARCH" = "arm64" ] || [ "$ARCH" = "aarch64" ]; then
    ARCH="arm64"
else
    echo -e "${RED}Unsupported architecture: $ARCH${NC}"
    exit 1
fi

if [ "$OS" != "darwin" ] && [ "$OS" != "linux" ]; then
    echo -e "${RED}Unsupported OS: $OS${NC}"
    exit 1
fi

# You must replace this with the actual URL to your hosted binaries
BINARY_URL="https://github.com/diyuksh/create-agency-app/releases/latest/download/template.sar.ga-${OS}-${ARCH}"

TMP_DIR=$(mktemp -d)
BINARY_PATH="${TMP_DIR}/template.sar.ga"

echo -e "Downloading binary for ${OS}-${ARCH}..."
curl -sL -o "$BINARY_PATH" "$BINARY_URL"
chmod +x "$BINARY_PATH"

echo -e "${GREEN}Starting CLI...${NC}\n"
# Run the binary
"$BINARY_PATH"

# Cleanup
rm -rf "$TMP_DIR"
