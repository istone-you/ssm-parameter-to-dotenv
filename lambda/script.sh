#!/bin/bash
# Fetch the parameters from AWS SSM and store them in a temporary file
temp_file=".env.temp"
echo -n "" > "$temp_file"
# Define the parameter
params=(
    "APP_NAME"
)
# Fetch the parameters from AWS SSM and write them to .env
for param in "${params[@]}"; do
    value=$(aws ssm get-parameters --region ap-northeast-1 --name "$param" --query "Parameters[0].Value" --output text)
    echo "$param=$value" >> "$temp_file"
done
# Overwrite the existing .env file with the temporary file
mv "$temp_file" .env
