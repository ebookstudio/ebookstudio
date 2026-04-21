#!/bin/bash

# --- EBOOKSTUDIO GIT AUTH HELPER ---
# This script helps resolve the 403 Forbidden error and configures identity.

echo "=========================================="
echo "   EBOOKSTUDIO GIT AUTHENTICATION HELPER   "
echo "=========================================="
echo ""

REPO_URL="https://github.com/ebookstudio/ebookstudio.git"
UPSTREAM_NAME="upstream"

# Ensure origin is also checked or fallback to origin if upstream doesn't exist
REMOTE_NAME=$(git remote | grep "^upstream$" || git remote | grep "^origin$" || echo "origin")

echo "Target Remote: $REMOTE_NAME"
git remote get-url $REMOTE_NAME 2>/dev/null || echo "Remote not found!"
echo ""

echo "Select an option to fix the 403 error or update identity:"
echo "1) Use a Personal Access Token (PAT) via HTTPS"
echo "2) Use SSH (Recommended for opendev-labs)"
echo "3) Reset to default HTTPS URL"
echo "4) Configure Git Identity (Name & Email)"
echo "q) Quit"
read -p "Choice [1-4, q]: " choice

case $choice in
    1)
        read -p "Enter your GitHub Personal Access Token: " token
        if [ -z "$token" ]; then
            echo "Token cannot be empty."
            exit 1
        fi
        NEW_URL="https://$token@github.com/ebookstudio/ebookstudio.git"
        git remote set-url $REMOTE_NAME "$NEW_URL"
        echo "Remote updated with PAT."
        ;;
    2)
        NEW_URL="git@github.com:ebookstudio/ebookstudio.git"
        git remote set-url $REMOTE_NAME "$NEW_URL"
        echo "Remote updated to SSH."
        echo "NOTE: Ensure your public key is added to https://github.com/settings/keys"
        ;;
    3)
        git remote set-url $REMOTE_NAME "$REPO_URL"
        echo "Remote reset to standard HTTPS."
        ;;
    4)
        echo "Configuring local identity for this repository..."
        read -p "Enter Git User Name [default: opendev-labs]: " git_name
        git_name=${git_name:-"opendev-labs"}
        read -p "Enter Git User Email: " git_email
        if [ -n "$git_email" ]; then
            git config --local user.name "$git_name"
            git config --local user.email "$git_email"
            echo "Identity configured: $git_name <$git_email>"
        else
            echo "Email is required for proper GitHub attribution."
        fi
        ;;
    q)
        echo "Exiting."
        exit 0
        ;;
    *)
        echo "Invalid choice."
        exit 1
        ;;
esac

echo ""
echo "Current Identity (Local):"
git config --local user.name || echo "Name not set locally"
git config --local user.email || echo "Email not set locally"
echo ""

echo "Try pushing again with: git push $REMOTE_NAME main"
echo "=========================================="
