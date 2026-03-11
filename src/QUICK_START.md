# ⚡ Quick Start - Push to GitHub

## 🚀 Fast Track (Copy & Paste)

```bash
# 1. Initialize and configure
git init
git config user.name "Abhishek"
git config user.email "your-email@example.com"

# 2. Connect to GitHub
git remote add origin https://github.com/Abhi241-bot/JungleSafariUI1.git

# 3. Add all files
git add .

# 4. Commit
git commit -m "Initial commit: Jungle Safari v1.0.0 - Complete zoo management system"

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

## 🔑 When Asked for Credentials

- **Username**: Abhi241-bot
- **Password**: Use your GitHub Personal Access Token (NOT your account password)

## 📋 Generate Token

1. Go to: https://github.com/settings/tokens
2. Click: "Generate new token (classic)"
3. Name: "Jungle Safari Upload"
4. Check: ✅ repo (all permissions)
5. Click: "Generate token"
6. **Copy immediately** (you won't see it again!)

## ✅ After First Push

For future updates:

```bash
# See what changed
git status

# Add changes
git add .

# Commit with message
git commit -m "Your update message"

# Push
git push
```

## 🆘 Quick Fixes

### If push is rejected:
```bash
git pull origin main --rebase
git push origin main
```

### If remote already exists:
```bash
git remote remove origin
git remote add origin https://github.com/Abhi241-bot/JungleSafariUI1.git
```

### Force push (use carefully!):
```bash
git push -u origin main --force
```

## 🎯 That's It!

Your code will be live at: https://github.com/Abhi241-bot/JungleSafariUI1

---

**Need more help?** Check [GITHUB_SETUP.md](./GITHUB_SETUP.md) for detailed instructions.
