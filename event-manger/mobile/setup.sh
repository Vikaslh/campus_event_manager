#!/bin/bash

# Colors for terminal output
GREEN="\033[0;32m"
YELLOW="\033[1;33m"
NC="\033[0m" # No Color

echo -e "${GREEN}=== Campus Events Mobile App Setup ===${NC}"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js before continuing.${NC}"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo -e "${YELLOW}npm is not installed. Please install npm before continuing.${NC}"
    exit 1
fi

# Install dependencies
echo -e "${GREEN}Installing dependencies...${NC}"
npm install

# Check if Expo CLI is installed globally
if ! command -v expo &> /dev/null; then
    echo -e "${YELLOW}Expo CLI not found. Installing globally...${NC}"
    npm install -g expo-cli
fi

echo -e "${GREEN}Setup complete!${NC}"
echo -e "${GREEN}To start the development server, run:${NC}"
echo -e "${YELLOW}cd mobile && npm start${NC}"

echo -e "${GREEN}To run on Android:${NC}"
echo -e "${YELLOW}npm run android${NC}"

echo -e "${GREEN}To run on iOS:${NC}"
echo -e "${YELLOW}npm run ios${NC}"

echo -e "${GREEN}Make sure your backend server is running at http://localhost:8000${NC}"