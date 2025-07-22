#!/usr/bin/env bash
cd "$(dirname "$0")"

PACT_BIN=${PACT_BIN:-$(dirname "$0")/../bin/pact}
# use the below line instead to locally test
#PACT_BIN=pact

failed_files=()
pact_files=("bonder.repl" "poller.repl" "gas-consumption-tests.repl" "gas-station.repl")

pact_script=""
for file in "${pact_files[@]}"; do
  pact_script+=$(printf '(do (print "START_%s") (load "%s" true) (print "END_%s"))\n' "$file" "$file" "$file")
done

# Run Pact once, feeding it the generated script via standard input, and capture all output.
output=$("$PACT_BIN" <<<"$pact_script" 2>&1)

# Loop through each Pact repl file
for file in "${pact_files[@]}"; do
  file_output=$(echo "$output" | awk "/START_${file}/{flag=1; next} /END_${file}/{flag=0} flag")

  # Extract only lines containing "FAILURE"
  error_lines=$(echo "$file_output" | grep 'FAILURE')

  if [[ -n "$error_lines" ]]; then
    failed_files+=("========= $file =========\n$error_lines\n\n")
  fi
done

# Check if any files failed
if [[ ${#failed_files[@]} -gt 0 ]]; then
  echo -e "The following files failed to load:"
  for failure in "${failed_files[@]}"; do
    echo -e "$failure"
  done
  exit 1
else
  echo "All files loaded successfully."
  exit 0
fi
