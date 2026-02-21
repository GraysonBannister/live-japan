#!/bin/zsh
# Live Japan - Data Ingestion Cron Script
# Runs daily to fetch new property listings

PROJECT_DIR="/Users/graysonbannister/Documents/live-japan"
LOG_FILE="/Users/graysonbannister/.openclaw/workspaces/live-japan/cron-ingest.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$DATE] Starting Live Japan data ingestion..." >> "$LOG_FILE"
cd "$PROJECT_DIR" || exit 1

# Run the ingestion script
/usr/local/bin/npm run ingest >> "$LOG_FILE" 2>&1
EXIT_CODE=$?

if [ $EXIT_CODE -eq 0 ]; then
    echo "[$DATE] Ingestion completed successfully" >> "$LOG_FILE"
else
    echo "[$DATE] Ingestion failed with exit code $EXIT_CODE" >> "$LOG_FILE"
fi

echo "[$DATE] ---" >> "$LOG_FILE"
exit $EXIT_CODE
