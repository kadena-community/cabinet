#!/bin/bash

# Function to display usage information
usage() {
  echo "Usage: $0 [-n network_url] [file1.ktpl file2.ktpl ...]"
  exit 1
}

# Default network URL
default_network_url="https://testnet-node.ecko.finance"
network_url="$default_network_url"

# Parse network URL from arguments
while getopts ":n:" opt; do
  case $opt in
    n)
      network_url="$OPTARG"
      ;;
    *)
      usage
      ;;
  esac
done
shift $((OPTIND -1))

# Check if at least one ktpl file is provided, otherwise use all ktpl files in the current directory
if [ $# -eq 0 ]; then
  templates=(*.ktpl)
else
  templates=("$@")
fi

# Loop through all provided or found .ktpl files
for template in "${templates[@]}"; do
  if [ ! -f "$template" ]; then
    echo "File $template not found. Skipping."
    continue
  fi

  # Generate a yaml from the template
  yaml_file="${template%.ktpl}.yaml"
  kda gen -t "$template" -d testnet.yaml -o "$yaml_file"

  # Sign the YAML file with dev.key
  kda sign -k bonder-gov.key "$yaml_file"
  kda sign -k bonder-ops.key "$yaml_file"
  kda sign -k ns-adm.key "$yaml_file"
  # Sign the YAML file again with admin.key, expecting it to become a JSON file
  kda sign -k new-ns-adm.key "$yaml_file"
  json_file="${yaml_file%.yaml}.json"

  # Local test of the JSON file
  if [ -f "$json_file" ]; then
    echo "Testing transaction locally with kda local..."
    local_result=$(kda local "$json_file" -n "$network_url" | jq .)
    echo "$local_result" | jq .

    # Prompt the user to confirm sending the transaction
    while true; do
      read -p "Do you want to send this transaction to the network? (y/n/c): " confirm
      case $confirm in
        [Yy]* )
          kda send "$json_file" -n "$network_url" | jq

          # Sleep for 10 seconds
          sleep 10

          # Poll for the transaction result and pretty-print it with jq
          result=$(kda poll "$json_file" -n "$network_url" | jq .)
          echo "$result" | jq .
          break
          ;;
        [Nn]* )
          echo "Transaction not sent."
          break
          ;;
        [Cc]* )
          echo "Exiting script."
          exit 0
          ;;
        * )
          echo "Please answer y, n, or c."
          ;;
      esac
    done
  else
    echo "Expected JSON file $json_file not found. Skipping local test, send, and poll."
  fi
done
