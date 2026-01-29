# 🚂 Railway Deployment Guide

## Step 1: Create Railway Account
1. Go to **https://railway.app**
2. Click **"Login with GitHub"**
3. Authorize Railway to access your GitHub

## Step 2: Create New Project
1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose: **kylerand/cart-configurator**
4. Railway will detect your repository

## Step 3: Configure Root Directory
Since this is a monorepo, Railway needs to know where the API is:

1. After the project is created, click on your service
2. Go to **Settings** tab
3. Scroll to **"Root Directory"**
4. Set it to: `apps/api`
5. Click **Save**

## Step 4: Set Environment Variables
1. Go to **Variables** tab
2. Click **"+ New Variable"**
3. Add these variables **ONE BY ONE**:

```bash
DATABASE_URL=postgresql://postgres.kpilvuhygudmyhlgcfdw:sE7Zf$k_wkT2VWZ@aws-1-us-east-2.pooler.supabase.com:5432/postgres

SUPABASE_URL=https://kpilvuhygudmyhlgcfdw.supabase.co

SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtwaWx2dWh5Z3VkbXlobGdjZmR3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2OTY5MDIzNiwiZXhwIjoyMDg1MjY2MjM2fQ.wF0f9U-f8lUSX_DyF7kZZIfRSZXyBWHYAldlJlLW-gM

JWT_SECRET=fc40911346e48148080a19cd4b82362a45e1325f31d8ab3e2dc01bb153950512

FRONTEND_URL=http://localhost:5173

NODE_ENV=production
```

**Note:** Don't set PORT - Railway sets this automatically

## Step 5: Configure Build Settings
1. Go to **Settings** tab
2. Scroll to **"Build Command"** (if it exists)
3. Override with:
```bash
npm install && npx prisma generate && npm run build
```

4. Scroll to **"Start Command"**
5. Override with:
```bash
npm run start
```

## Step 6: Deploy!
1. Railway should auto-deploy after you save settings
2. Watch the **Deployments** tab for logs
3. First deploy takes ~2-3 minutes

## Step 7: Get Your Railway URL
1. Once deployed, go to **Settings** tab
2. Scroll to **"Domains"**
3. Click **"Generate Domain"**
4. Copy the URL (looks like: `https://cart-configurator-production-xxxx.up.railway.app`)

## Step 8: Update CORS
After you get the Railway URL, you need to update the CORS settings:

1. Go back to **Variables** tab
2. Find **FRONTEND_URL**
3. Update it to your Vercel URL (we'll get this in next step)
4. The app will auto-redeploy

## ✅ Verify Deployment
Once deployed, test these URLs:

1. Health check:
   ```
   https://your-railway-url.railway.app/health
   ```
   Should return: `{"status":"ok","timestamp":"..."}`

2. Platforms endpoint (will fail auth, but that's OK):
   ```
   https://your-railway-url.railway.app/api/admin/platforms
   ```
   Should return: `{"error":"No token provided"}`

---

## 🐛 Troubleshooting

**Build fails with "Cannot find module":**
- Make sure Root Directory is set to `apps/api`
- Check that build command includes `npx prisma generate`

**Database connection fails:**
- Check DATABASE_URL is correct
- Verify password is properly escaped ($ becomes %24)

**App crashes on start:**
- Check logs in Deployments tab
- Verify all environment variables are set
- Make sure NODE_ENV=production

---

## 📝 What's Next?
After Railway deploys successfully:
1. Copy your Railway URL
2. We'll deploy the frontend to Vercel
3. Then update both to point to each other

**Let me know when Railway is deployed and share the URL!**
