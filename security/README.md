# 🔐 Secret Management (SOPS + Age)

> [!IMPORTANT]  
> This repository uses Mozilla SOPS and Age for GitOps-style secret management. No plaintext passwords or API keys are ever committed to version control.

## How it Works

Files ending in `.enc.yaml` are encrypted. The values are scrambled, but the YAML keys remain readable, making code review easy without exposing sensitive data.
