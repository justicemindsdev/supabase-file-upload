#!/bin/bash

# Supabase File Upload Script
# This script uploads video files to Supabase Storage

# Supabase configuration
SUPABASE_URL="https://tvecnfdqakrevzaeifpk.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZWNuZmRxYWtyZXZ6YWVpZnBrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDgzODIwNjQsImV4cCI6MjA2Mzk1ODA2NH0.q-8ukkJZ4FGSbZyEYp0letP-S58hC2PA6lUOWUH9H2Y"
BUCKET_NAME="sites"
STORAGE_URL="https://tvecnfdqakrevzaeifpk.supabase.co/storage/v1/s3"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to display usage information
show_usage() {
  echo -e "${BLUE}Supabase Video Upload Script${NC}"
  echo -e "Usage: $0 [options] <file_path>"
  echo -e "\nOptions:"
  echo -e "  -h, --help                 Show this help message"
  echo -e "  -f, --folder <folder>      Specify target folder (default: video)"
  echo -e "  -n, --name <name>          Specify custom filename (default: original filename)"
  echo -e "  -p, --public               Make the file publicly accessible"
  echo -e "  -v, --verbose              Enable verbose output"
  echo -e "\nExample:"
  echo -e "  $0 -f marketing -n promo2025 -p my_video.mp4"
}

# Default values
TARGET_FOLDER="video"
CUSTOM_NAME=""
PUBLIC_ACCESS=false
VERBOSE=false

# Parse command line arguments
POSITIONAL=()
while [[ $# -gt 0 ]]; do
  key="$1"
  case $key in
    -h|--help)
      show_usage
      exit 0
      ;;
    -f|--folder)
      TARGET_FOLDER="$2"
      shift
      shift
      ;;
    -n|--name)
      CUSTOM_NAME="$2"
      shift
      shift
      ;;
    -p|--public)
      PUBLIC_ACCESS=true
      shift
      ;;
    -v|--verbose)
      VERBOSE=true
      shift
      ;;
    *)
      POSITIONAL+=("$1")
      shift
      ;;
  esac
done
set -- "${POSITIONAL[@]}"

# Check if a file was provided
if [ $# -eq 0 ]; then
  echo -e "${RED}Error: No file specified${NC}"
  show_usage
  exit 1
fi

FILE_PATH="$1"

# Check if file exists
if [ ! -f "$FILE_PATH" ]; then
  echo -e "${RED}Error: File '$FILE_PATH' not found${NC}"
  exit 1
fi

# Get file information
FILE_NAME=$(basename "$FILE_PATH")
FILE_EXT="${FILE_NAME##*.}"
FILE_SIZE=$(stat -f%z "$FILE_PATH" 2>/dev/null || stat -c%s "$FILE_PATH" 2>/dev/null)
FILE_SIZE_MB=$(echo "scale=2; $FILE_SIZE / 1048576" | bc)

# Use custom name if provided
if [ -n "$CUSTOM_NAME" ]; then
  # Add extension if not present in custom name
  if [[ "$CUSTOM_NAME" != *.$FILE_EXT ]]; then
    CUSTOM_NAME="$CUSTOM_NAME.$FILE_EXT"
  fi
  UPLOAD_NAME="$CUSTOM_NAME"
else
  # Add timestamp to original filename to avoid conflicts
  TIMESTAMP=$(date +%s)
  UPLOAD_NAME="${TIMESTAMP}-${FILE_NAME}"
fi

# Full path in the bucket
STORAGE_PATH="${TARGET_FOLDER}/${UPLOAD_NAME}"

# Display upload information
echo -e "${BLUE}Uploading to Supabase Storage${NC}"
echo -e "File: ${YELLOW}$FILE_NAME${NC}"
echo -e "Size: ${YELLOW}$FILE_SIZE_MB MB${NC}"
echo -e "Destination: ${YELLOW}$BUCKET_NAME/$STORAGE_PATH${NC}"
echo -e "Public access: ${YELLOW}$PUBLIC_ACCESS${NC}"

# Confirm upload
read -p "Continue with upload? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${YELLOW}Upload cancelled${NC}"
  exit 0
fi

# Set content type based on file extension
case "$FILE_EXT" in
  mp4|MP4)
    CONTENT_TYPE="video/mp4"
    ;;
  mov|MOV)
    CONTENT_TYPE="video/quicktime"
    ;;
  avi|AVI)
    CONTENT_TYPE="video/x-msvideo"
    ;;
  webm|WEBM)
    CONTENT_TYPE="video/webm"
    ;;
  *)
    CONTENT_TYPE="application/octet-stream"
    ;;
esac

# Upload file to Supabase Storage
echo -e "${BLUE}Starting upload...${NC}"

# Set cache control and content disposition headers
CACHE_CONTROL="max-age=3600"
CONTENT_DISPOSITION="inline; filename=\"$UPLOAD_NAME\""

# Prepare curl command
CURL_CMD="curl -X POST \"$STORAGE_URL/upload/resumable\" \
  -H \"Authorization: Bearer $SUPABASE_KEY\" \
  -H \"Content-Type: application/json\" \
  -d '{\"bucket\":\"$BUCKET_NAME\",\"path\":\"$STORAGE_PATH\",\"file\":{\"name\":\"$UPLOAD_NAME\",\"size\":$FILE_SIZE,\"type\":\"$CONTENT_TYPE\"},\"cacheControl\":\"$CACHE_CONTROL\"}'"

# Execute curl command to get upload URL
if [ "$VERBOSE" = true ]; then
  echo -e "${YELLOW}Executing: $CURL_CMD${NC}"
fi

UPLOAD_RESPONSE=$(eval $CURL_CMD)

if [ "$VERBOSE" = true ]; then
  echo -e "${YELLOW}Response: $UPLOAD_RESPONSE${NC}"
fi

# Extract upload URL from response
UPLOAD_URL=$(echo $UPLOAD_RESPONSE | grep -o '"url":"[^"]*"' | sed 's/"url":"//;s/"//')

if [ -z "$UPLOAD_URL" ]; then
  echo -e "${RED}Error: Failed to get upload URL${NC}"
  echo -e "${RED}Response: $UPLOAD_RESPONSE${NC}"
  exit 1
fi

# Upload the file
echo -e "${BLUE}Uploading file...${NC}"

UPLOAD_CMD="curl -X PUT \"$UPLOAD_URL\" \
  -H \"Content-Type: $CONTENT_TYPE\" \
  -H \"Content-Disposition: $CONTENT_DISPOSITION\" \
  -H \"Cache-Control: $CACHE_CONTROL\" \
  --data-binary @\"$FILE_PATH\" \
  --progress-bar"

if [ "$VERBOSE" = true ]; then
  echo -e "${YELLOW}Executing: $UPLOAD_CMD${NC}"
fi

UPLOAD_RESULT=$(eval $UPLOAD_CMD)

# Check if upload was successful
if [ $? -eq 0 ]; then
  echo -e "${GREEN}Upload successful!${NC}"
  
  # Get public URL if requested
  if [ "$PUBLIC_ACCESS" = true ]; then
    PUBLIC_URL="$STORAGE_URL/object/public/$BUCKET_NAME/$STORAGE_PATH"
    echo -e "${GREEN}Public URL: $PUBLIC_URL${NC}"
    
    # Copy URL to clipboard if available
    if command -v pbcopy &> /dev/null; then
      echo "$PUBLIC_URL" | pbcopy
      echo -e "${GREEN}URL copied to clipboard${NC}"
    elif command -v xclip &> /dev/null; then
      echo "$PUBLIC_URL" | xclip -selection clipboard
      echo -e "${GREEN}URL copied to clipboard${NC}"
    fi
  fi
else
  echo -e "${RED}Upload failed${NC}"
  if [ "$VERBOSE" = true ]; then
    echo -e "${RED}Result: $UPLOAD_RESULT${NC}"
  fi
  exit 1
fi

exit 0
