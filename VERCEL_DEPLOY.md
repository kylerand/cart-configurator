# ▲ Vercel Deployment Guide

## Step 1: Create Vercel Account
1. Go to **https://vercel.com**
2. Click **"Sign Up"** 
3. Choose **"Continue with GitHub"**
4. Authorize Vercel to access your GitHub

## Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find **kylerand/cart-configurator** in the list
3. Click **"Import"**

## Step 3: Configure Project Settings

### Framework Preset
- Select: **"Vite"**

### Root Directory
- **Framework:** Vite
- **Root Directory:** Set to `apps/web`
- Click **"Continue"**

### Build Settings
The project includes a custom `build:full` script that handles the monorepo:
- **Framework Preset:** Vite
- **Root Directory:** `apps/web`
- **Build Command:** `npm run build:full` (auto-detected from vercel.json)
- **Output Directory:** `dist` (auto-detected)
- **Install Command:** `cd ../.. && npm install` (auto-detected)

## Step 4: Environment Variables
Before deploying, add these environment variables:

Click **"Environment Variables"** and add:

```bash
VITE_SUPABASE_URL=https://kpilvuhygudmyhlgcfdw.supabase.co

VITE_SUPABASE_ANON_KEY=sb_publishable_vcZnafbkuhY2h5VaMnk47g_2qxcir0I

VITE_API_URL=YOUR_RAILWAY_URL_HERE
```

**⚠️ IMPORTANT:** Replace `YOUR_RAILWAY_URL_HERE` with your actual Railway URL from the previous step!

Example:
```
VITE_API_URL=https://cart-configurator-production-xxxx.up.railway.app
```

## Step 5: Deploy!
1. Click **"Deploy"**
2. First build takes ~2-3 minutes
3. Watch the build logs

## Step 6: Get Your Vercel URL
Once deployed:
1. Vercel shows your URL at the top (like: `https://cart-configurator-xyz.vercel.app`)
2. **Copy this URL**

## Step 7: Update Railway CORS
Now go back to Railway and update the frontend URL:

1. Go to your Railway project
2. Click on **Variables** tab
3. Update `FRONTEND_URL` to your Vercel URL:
   ```
   FRONTEND_URL=https://cart-configurator-xyz.vercel.app
   ```
4. Save (Railway will auto-redeploy)

## ✅ Verify Deployment

### Test the Frontend
1. Visit your Vercel URL
2. You should see the configurator homepage

### Test Admin Login
1. Go to: `https://your-vercel-url.vercel.app/admin`
2. Try logging in with your admin credentials
3. Should connect to Railway backend and work!

### Test API Connection
Open browser console and check for:
- No CORS errors
- API requests going to Railway URL
- Admin panel loading data

---

## 🐛 Troubleshooting

**Build fails:**
- Check that Root Directory is `apps/web`
- Verify all VITE_ environment variables are set
- Check build logs for specific errors

**CORS errors after deployment:**
- Make sure you updated Railway's FRONTEND_URL
- Check that VITE_API_URL doesn't have trailing slash
- Wait 30 seconds for Railway to redeploy

**Admin login fails:**
- Check browser console for API errors
- Verify VITE_API_URL is correct
- Test Railway health endpoint directly

**Build succeeds but app is blank:**
- Check that all VITE_ variables are set correctly
- Verify environment variables have "Production" checked
- Redeploy from Vercel dashboard

---

## 🎉 Success Checklist

After both deployments:
- [ ] Vercel frontend loads at your domain
- [ ] Admin login works
- [ ] Can see platforms, options, materials
- [ ] No CORS errors in console
- [ ] Railway health endpoint responds

---

## 📝 Final Configuration URLs

**Frontend (Vercel):**
```
https://your-app.vercel.app
```

**Backend (Railway):**
```
https://your-api.railway.app
```

**Admin Panel:**
```
https://your-app.vercel.app/admin
```

**Database (Supabase):**
```
https://kpilvuhygudmyhlgcfdw.supabase.co
```

---

## 🚀 Next Steps After Deployment

1. **Set up custom domain** (optional)
   - In Vercel: Settings → Domains
   - Add your custom domain
   
2. **Enable automatic deployments**
   - Already enabled! Every push to main branch deploys automatically
   
3. **Set up preview deployments**
   - Already enabled! Every PR gets a preview URL

4. **Monitor your app**
   - Railway: Check logs and metrics
   - Vercel: Check analytics and logs
   - Supabase: Check database health

**You're live! 🎉**
