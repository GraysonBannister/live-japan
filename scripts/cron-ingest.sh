#!/bin/zsh
# Live Japan - Data Ingestion Cron Script
# Runs daily to fetch new property listings

# Ensure PATH includes Homebrew and npm
export PATH="/usr/local/bin:/opt/homebrew/bin:$HOME/.nvm/versions/node/v22.14.0/bin:$PATH"

PROJECT_DIR="/Users/graysonbannister/Documents/live-japan"
LOG_FILE="/Users/graysonbannister/Documents/live-japan/cron-ingest.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting Live Japan data ingestion..." >> "$LOG_FILE"
echo "[$DATE] PATH: $PATH" >> "$LOG_FILE"
cd "$PROJECT_DIR" || exit 1

# Run the ingestion script
npm run ingest >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "[$DATE] Ingestion completed successfully" >> "$LOG_FILE"
else
    echo "[$DATE] Ingestion failed with exit code $EXIT_CODE" >> "$LOG_FILE"
fi

echo "[$DATE] ---" >> "$LOG_FILE"
exit $EXIT_CODE
