---
description: How to deploy the Delhi Metro API backend to Netlify for free (runs forever online)
---

# Deploy Backend to Netlify

This deploys the `try backend/delhi-metro-netlify` folder as a serverless Netlify Function that runs the Delhi Metro routing API **forever online for free**.

## Prerequisites
- GitHub account
- Netlify account (free at https://app.netlify.com)

## Steps

### 1. Create a separate GitHub repo for the backend

// turbo
```bash
cd "try backend/delhi-metro-netlify"
git init
git add .
git commit -m "Initial commit: Delhi Metro API - Netlify Functions"
```

### 2. Push to GitHub

```bash
# Create repo on GitHub first (e.g., "delhi-metro-api")
git remote add origin https://github.com/YOUR_USERNAME/delhi-metro-api.git
git branch -M main
git push -u origin main
```

### 3. Connect to Netlify

1. Go to https://app.netlify.com
2. Click **"Add new site"** → **"Import an existing project"**
3. Connect your GitHub account
4. Select the `delhi-metro-api` repo
5. Build settings are auto-detected from `netlify.toml`:
   - Build command: *(leave empty)*
   - Publish directory: `.`
   - Functions directory: `netlify/functions`
6. Click **Deploy site**

### 4. Watch it go live

After ~30 seconds, your API will be live at:
```
https://your-site-name.netlify.app/route?from=Rajiv%20Chowk&to=Hauz%20Khas
```

### 5. Update the frontend .env

Update `LIBRE-METRO/.env.local`:
```env
NEXT_PUBLIC_METRO_API_URL=https://your-site-name.netlify.app
API=https://your-site-name.netlify.app
```

### 6. Test it

// turbo
```bash
curl "https://your-site-name.netlify.app/route?from=Rajiv%20Chowk&to=Hauz%20Khas"
```

## Notes

- **Free tier**: 125,000 function invocations per month
- **Cold start**: ~200ms (graph builds once per container)
- **Auto-deploys**: Every push to GitHub triggers a redeploy
- **No downtime**: Netlify handles scaling automatically
- **Custom domain**: You can add a custom domain in Netlify Site Settings
