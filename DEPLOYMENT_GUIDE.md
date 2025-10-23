# Icebreaking Machine - Vercel Deployment Guide

## Prerequisites ✅
- ✅ Vercel account created
- ✅ GitHub account created
- ⏳ Now let's deploy!

---

## Method 1: Deploy via GitHub (RECOMMENDED)

### Step 1: Download Your Project Files

First, you need to get all your project files. I'll create a list of what you need:

**Required Files:**
```
index.html
README.md
.gitignore
.env.example

css/
├── style.css
├── settings.css
└── chunk5-styles.css

js/
├── app.js
├── contact-manager.js
├── research-engine.js
├── research-ui.js
├── icebreaker-engine.js
├── results-ui.js
├── contact-ui.js
├── credit-tracker.js
├── feedback-ui.js
├── learning-engine.js
├── dashboard-ui.js
├── settings-model.js
├── settings-ui.js
├── prompt-defaults.js
├── prompt-builder.js
├── ai-client.js
└── utils/
    ├── export.js
    └── queue.js

api/
└── generate.js

netlify/
└── functions/
    └── generate.js
```

### Step 2: Create GitHub Repository

1. **Go to GitHub.com**
2. **Click the "+" icon** in top right → "New repository"
3. **Repository settings:**
   - Name: `icebreaking-machine` (or whatever you prefer)
   - Description: "AI-powered icebreaker generation for CRE professionals"
   - ✅ Make it **Public** (required for free Vercel deployment)
   - ✅ Check "Add a README file"
   - Click **"Create repository"**

### Step 3: Upload Files to GitHub

**Option A: Via GitHub Web Interface (Easier)**

1. In your new repository, click **"Add file"** → "Upload files"
2. **Drag and drop** all your project files/folders
3. Scroll down, add commit message: "Initial commit"
4. Click **"Commit changes"**

**Option B: Via Git Command Line (Advanced)**

```bash
# Navigate to your project folder
cd /path/to/your/project

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit"

# Connect to GitHub (replace with your URL)
git remote add origin https://github.com/YOUR-USERNAME/icebreaking-machine.git

# Push
git branch -M main
git push -u origin main
```

### Step 4: Deploy to Vercel

1. **Go to [vercel.com/dashboard](https://vercel.com/dashboard)**
2. Click **"Add New..."** → "Project"
3. Click **"Import Git Repository"**
4. **Select your GitHub account** (may need to authorize Vercel)
5. **Find "icebreaking-machine"** and click **"Import"**
6. **Configure Project:**
   - Framework Preset: **"Other"** (leave default)
   - Root Directory: `./` (leave default)
   - Build Command: (leave empty)
   - Output Directory: (leave empty)
   - Click **"Deploy"**

7. **Wait 30-60 seconds** for deployment

8. **Your site is live!** 🎉
   - You'll get a URL like: `icebreaking-machine.vercel.app`
   - Click "Visit" to see your app

---

## Method 2: Deploy Directly (No GitHub)

If you don't want to use GitHub:

### Option A: Vercel CLI

1. **Install Vercel CLI:**
```bash
npm install -g vercel
```

2. **Navigate to project folder:**
```bash
cd /path/to/your/project
```

3. **Deploy:**
```bash
vercel
```

4. **Follow prompts:**
   - Set up and deploy? **Y**
   - Which scope? (Choose your account)
   - Link to existing project? **N**
   - Project name? `icebreaking-machine`
   - Directory? `./` (press Enter)
   - Override settings? **N**

5. **Done!** You'll get a live URL

### Option B: Drag & Drop (Simplest)

1. **Zip all your project files**
2. **Go to [vercel.com/new](https://vercel.com/new)**
3. **Drag and drop** the zip file
4. **Wait for deployment**
5. **Get your URL!**

---

## Method 3: Download Project as ZIP (If needed)

If you need to download the project files first, you can use the Genspark download feature or I can help you verify you have all the necessary files.

---

## After Deployment

### Your App Will Be Live At:
```
https://your-project-name.vercel.app
```

### Test Functionality:
1. ✅ Navigate between tabs (Dashboard, Research, Results, Settings, Feedback)
2. ✅ Add a contact
3. ✅ Generate icebreakers (simulation mode)
4. ✅ Export CSV
5. ✅ Modify settings

### Everything Should Work:
- ✅ All navigation (no more blank pages!)
- ✅ Contact management
- ✅ Research simulation
- ✅ Icebreaker generation
- ✅ Results library
- ✅ Settings (fully editable)
- ✅ CSV export/import
- ✅ Credit tracking
- ✅ Feedback system

---

## Optional: Enable Live AI Mode

If you want to use **real AI generation** (Anthropic Claude or OpenAI):

### Step 1: Get API Key

**For Anthropic Claude:**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up / Log in
3. Go to "API Keys"
4. Create new key
5. Copy the key (starts with `sk-ant-`)

**For OpenAI:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to "API Keys"
4. Create new key
5. Copy the key (starts with `sk-`)

### Step 2: Add to Vercel

1. **Go to your Vercel dashboard**
2. **Click your project** (icebreaking-machine)
3. **Go to "Settings"** tab
4. **Click "Environment Variables"**
5. **Add new variable:**
   - Key: `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
   - Value: (paste your API key)
   - Environment: Production
   - Click "Save"
6. **Redeploy** (go to Deployments → click "..." → "Redeploy")

### Step 3: Enable in App

1. **Open your live app**
2. **Go to Settings → AI Prompts tab**
3. **Enable "Use Live AI"**
4. **Select provider** (Anthropic or OpenAI)
5. **Enter model name** (e.g., `claude-3-5-sonnet-20241022`)
6. **Save settings**
7. **Generate icebreakers** - now uses real AI! 🤖

**Cost:** ~$0.005-$0.02 per icebreaker (½¢ to 2¢)

---

## Troubleshooting

### Issue: Files not uploading to GitHub
**Solution:** 
- Try uploading folders one at a time
- Or use GitHub Desktop app for easier file management

### Issue: Vercel deployment fails
**Solution:**
- Check that index.html is in the root directory
- Make sure all file paths are relative (no absolute paths)
- Check Vercel deployment logs for errors

### Issue: App works but pages still blank
**Solution:**
- Hard refresh (Ctrl+Shift+R)
- Clear browser cache
- Try different browser
- Check browser console for errors

### Issue: API not working
**Solution:**
- Verify API key is correct in Vercel environment variables
- Check API key has credits/is active
- Look at Vercel function logs for errors

---

## Custom Domain (Optional)

Want your own domain like `icebreaking.yourcompany.com`?

1. **Buy domain** (Namecheap, Google Domains, etc.)
2. **In Vercel:**
   - Go to project Settings → Domains
   - Click "Add"
   - Enter your domain
   - Follow DNS setup instructions
3. **Wait for DNS propagation** (5-60 minutes)
4. **Done!** Your app is on your domain

---

## Update Your App Later

### Method 1: Via GitHub
1. Make changes to files
2. Commit and push to GitHub
3. Vercel automatically redeploys

### Method 2: Via Vercel CLI
1. Make changes to files
2. Run `vercel` in project folder
3. New deployment created

---

## What You Get With This Deployment

### ✅ Fully Functional Web App
- Works on desktop, tablet, mobile
- No installation required
- Share URL with team members
- Accessible from anywhere

### ✅ Free Hosting
- Vercel free tier includes:
  - Unlimited bandwidth
  - Automatic HTTPS
  - Global CDN
  - Automatic deployments

### ✅ Production Ready
- Fast loading
- Secure (HTTPS)
- Professional URL
- No "demo" limitations

---

## Next Steps

1. **Deploy the app** using one of the methods above
2. **Test all functionality** on the live URL
3. **Share the URL** with your team
4. **Optional:** Set up Live AI mode with API keys
5. **Optional:** Add custom domain

---

## Need Help?

If you run into issues:
1. Check the Vercel deployment logs
2. Check browser console for JavaScript errors
3. Verify all files uploaded correctly
4. Make sure file structure matches the list above

Let me know which deployment method you'd like to use and I'll guide you through it step by step! 🚀
