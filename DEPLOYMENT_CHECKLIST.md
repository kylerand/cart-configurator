# 🚀 Quick Deployment Checklist

## ✅ What We've Done So Far

- [x] Migrated database from SQLite to PostgreSQL (Supabase)
- [x] Tested API locally with PostgreSQL - works!
- [x] Created Railway deployment config (nixpacks.toml)
- [x] Created Vercel deployment config (vercel.json)
- [x] Generated secure JWT secret
- [x] Pushed all code to GitHub
- [x] Created deployment guides

## 🎯 What You Need To Do Now

### Step 1: Deploy Backend to Railway (~10 minutes)

1. **Create Railway Account:**
   - Go to https://railway.app
   - Sign in with GitHub
   
2. **Create New Project:**
   - Click "New Project" → "Deploy from GitHub repo"
   - Select: `kylerand/cart-configurator`
   
3. **Configure Settings:**
   - Set **Root Directory** to: `apps/api`
   - Set **Build Command** to: `npm install && npx prisma generate && npm run build`
   - Set **Start Command** to: `npm run start`
   
4. **Add Environment Variables:**
   Copy these from `.env.railway` file:
   ```
   DATABASE_URL=postgresql://postgres.kpilvuhygudmyhlgcfdw:sE7Zf$k_wkT2VWZ@aws-1-us-east-2.pooler.supabase.com:5432/postgres
   SUPABASE_URL=https://kpilvuhygudmyhlgcfdw.supabase.co
   SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   JWT_SECRET=fc40911346e48148080a19cd4b82362a45e1325f31d8ab3e2dc01bb153950512
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=production
   ```
   
5. **Generate Domain:**
   - Go to Settings → Domains
   - Click "Generate Domain"
   - **Copy your Railway URL** (you'll need it for Vercel!)

6. **Verify it works:**
   - Visit: `https://your-railway-url.railway.app/health`
   - Should return: `{"status":"ok",...}`

---

### Step 2: Deploy Frontend to Vercel (~10 minutes)

1. **Create Vercel Account:**
   - Go to https://vercel.com
   - Sign in with GitHub
   
2. **Import Project:**
   - Click "Add New..." → "Project"
   - Select: `kylerand/cart-configurator`
   - Click "Import"
   
3. **Configure Settings:**
   - Framework: **Vite**
   - Root Directory: `apps/web`
   - Build Command: `npm run build` (auto-detected)
   - Output Directory: `dist` (auto-detected)
   
4. **Add Environment Variables:**
   ```
   VITE_SUPABASE_URL=https://kpilvuhygudmyhlgcfdw.supabase.co
   VITE_SUPABASE_ANON_KEY=sb_publishable_vcZnafbkuhY2h5VaMnk47g_2qxcir0I
   VITE_API_URL=YOUR_RAILWAY_URL_HERE
   ```
   
   **⚠️ Replace `YOUR_RAILWAY_URL_HERE` with your actual Railway URL from Step 1!**
   
5. **Deploy!**
   - Click "Deploy"
   - Wait ~2-3 minutes
   
6. **Get Your Vercel URL:**
   - Copy the URL shown after deployment
   - Example: `https://cart-configurator-xyz.vercel.app`

---

### Step 3: Update CORS (~2 minutes)

Now that you have your Vercel URL:

1. **Go back to Railway**
2. **Update the `FRONTEND_URL` variable:**
   - Change from: `http://localhost:5173`
   - To: `https://cart-configurator-xyz.vercel.app` (your actual Vercel URL)
3. **Save** (Railway auto-redeploys in ~30 seconds)

---

### Step 4: Test Everything! (~5 minutes)

1. **Visit your Vercel URL**
   - Homepage should load
   
2. **Test Admin Panel:**
   - Go to: `https://your-vercel-url.vercel.app/admin`
   - Login with your admin credentials
   - Check platforms, options, materials load
   
3. **Check Browser Console:**
   - Open DevTools (F12)
   - No CORS errors
   - API calls going to Railway URL
   
4. **Test a Feature:**
   - Create a new platform or option
   - Verify it saves to database
   - Check it persists after refresh

---

## 🎉 Success!

Your Golf Cart Configurator is now LIVE on the internet!

**Your URLs:**
- **Frontend:** https://your-app.vercel.app
- **Backend API:** https://your-api.railway.app
- **Admin Panel:** https://your-app.vercel.app/admin
- **Database:** Supabase (PostgreSQL)

**Auto-Deployments:**
- Every push to `main` branch automatically deploys
- Railway: Backend deploys in ~2-3 minutes
- Vercel: Frontend deploys in ~2-3 minutes

---

## 📚 Full Guides Available

If you need more details:
- **RAILWAY_DEPLOY.md** - Complete Railway setup guide
- **VERCEL_DEPLOY.md** - Complete Vercel setup guide
- **MIGRATION_STATUS.md** - Database migration summary

---

## ❓ Questions?

Just let me know if you hit any issues! Common ones:
- CORS errors → Check FRONTEND_URL in Railway
- Build fails → Check Root Directory setting
- 404 errors → Check environment variables are set

**Ready to deploy? Let's do this! 🚀**
