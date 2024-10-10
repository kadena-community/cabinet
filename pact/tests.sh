#!/usr/bin/env bash
cd "$(dirname "$0")"

PACT_BIN=${PACT_BIN:-$(dirname "$0")/../bin/pact}
# use the below line instead to locally test
#PACT_BIN=pact

failed_files=()

# The list of files to test — any time we add a new test file it should be added here too.
pact_files=("bonder.repl" "gas-station.repl" "poller.repl")

# Loop through each Pact repl file
for file in "${pact_files[@]}"; do
  # Execute the Pact repl file
  output=$("$PACT_BIN" "$file" 2>&1)

  # Check the exit status and output message
  if [[ $? -ne 0 ]]; then
    # Add the failed file and its output to the array
    failed_files+=("========== $file ==========\n\n$output\n\n")
  fi
done

# Check if any files failed
if [[ ${#failed_files[@]} -gt 0 ]]; then
  echo -e "The following files failed to load:"
  for file_output in "${failed_files[@]}"; do
    echo -e "$file_output"
  done
  exit 1
else
  echo "All files loaded successfully."
  exit 0
fi
