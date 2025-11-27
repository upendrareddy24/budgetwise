# Deploying BudgetWise to GitHub Pages

Follow these steps to deploy your app to GitHub Pages for free hosting.

## Prerequisites

- GitHub account (create one at https://github.com if you don't have one)
- Git installed on your computer

## Step-by-Step Deployment

### 1. Initialize Git Repository

Open PowerShell in the budget-app folder and run:

```powershell
cd d:\AntiGravity\budget-app
git init
git add .
git commit -m "Initial commit: BudgetWise app"
```

### 2. Create GitHub Repository

1. Go to https://github.com/new
2. Repository name: `budgetwise` (or any name you prefer)
3. Description: "Smart budget tracking app with AI-powered insights"
4. Make it **Public** (required for free GitHub Pages)
5. **Don't** initialize with README (we already have one)
6. Click "Create repository"

### 3. Push to GitHub

Copy the commands from GitHub (they'll look like this):

```powershell
git remote add origin https://github.com/YOUR_USERNAME/budgetwise.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your actual GitHub username.

### 4. Enable GitHub Pages

1. Go to your repository on GitHub
2. Click "Settings" tab
3. Click "Pages" in the left sidebar
4. Under "Source":
   - Select branch: `main`
   - Select folder: `/ (root)`
5. Click "Save"

### 5. Wait for Deployment

- GitHub will build and deploy your site (takes 1-2 minutes)
- You'll see a green checkmark when ready
- Your site URL will be: `https://YOUR_USERNAME.github.io/budgetwise/`

### 6. Update README

Edit `README.md` and replace the demo URL with your actual GitHub Pages URL.

## 🎉 Done!

Your app is now live and accessible to anyone with the URL!

## Updating Your App

Whenever you make changes:

```powershell
git add .
git commit -m "Description of changes"
git push
```

GitHub Pages will automatically redeploy (takes 1-2 minutes).

## Custom Domain (Optional)

Want a custom domain like `budgetwise.com`?

1. Buy a domain from Namecheap, Google Domains, etc.
2. In GitHub repo settings → Pages → Custom domain
3. Add your domain and follow DNS setup instructions

## Troubleshooting

**Site not loading?**
- Wait 2-3 minutes after first deployment
- Check Settings → Pages for deployment status
- Make sure repository is Public

**404 errors?**
- Verify branch is `main` and folder is `/ (root)`
- Check that `index.html` is in the root folder

**Need help?**
- GitHub Pages docs: https://docs.github.com/en/pages
- Or open an issue in your repository

---

## Quick Commands Reference

```powershell
# First time setup
cd d:\AntiGravity\budget-app
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/YOUR_USERNAME/budgetwise.git
git push -u origin main

# Future updates
git add .
git commit -m "Update: description of changes"
git push
```

That's it! Your BudgetWise app is now live on the internet! 🚀
