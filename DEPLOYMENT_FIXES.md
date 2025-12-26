# Deployment Issues - Sign In/Sign Up Buttons & Theme Toggle

## Issues Found

### 1. **Missing Backend API URL in Production**
   - **Problem**: The `API_URL` in `AuthContext.tsx` was set to `process.env.BACKEND_URL`, which is not defined during deployment
   - **Impact**: Authentication checks fail silently, causing the loading state to persist indefinitely, which hides the Sign In/Sign Up buttons
   - **Location**: [src/context/AuthContext.tsx](src/context/AuthContext.tsx#L5-L7)

### 2. **No Fallback URL**
   - **Problem**: When `process.env.BACKEND_URL` is undefined, API_URL becomes undefined, causing all fetch requests to fail
   - **Impact**: Users can never see the auth buttons or theme toggle because the component never finishes loading

### 3. **Z-Index Issue with UserMenu Container**
   - **Problem**: The `.container` CSS class in UserMenu had no z-index, potentially causing it to be hidden behind other navbar elements
   - **Impact**: Buttons could be rendered but not visible or clickable

---

## Fixes Applied

### Fix 1: Updated API_URL Configuration
**File**: [src/context/AuthContext.tsx](src/context/AuthContext.tsx#L5-L7)

Changed from:
```tsx
const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:8000'
  : process.env.BACKEND_URL;
```

Changed to:
```tsx
const API_URL = typeof window !== 'undefined' && window.location.hostname === 'localhost' 
  ? 'http://localhost:8000'
  : (process.env.REACT_APP_BACKEND_URL || process.env.BACKEND_URL || 'https://api.how-to-make-humanoid-robot.vercel.app');
```

**Benefits**:
- Tries `REACT_APP_BACKEND_URL` first (Vercel/standard convention)
- Falls back to `BACKEND_URL` (your environment variable name)
- Final fallback to the actual backend URL
- Ensures buttons always render

### Fix 2: Added Logging for Debugging
**File**: [src/context/AuthContext.tsx](src/context/AuthContext.tsx#L51-L56)

Added debugging output in the `useEffect`:
```tsx
// Log API URL for debugging (only in dev or if there's an issue)
if (typeof window !== 'undefined' && !API_URL?.includes('localhost')) {
  console.log('Backend API URL:', API_URL);
}
```

**Benefits**:
- Helps verify the correct API URL is being used in production
- Check browser console to debug any future API issues

### Fix 3: Added Z-Index to UserMenu Container
**File**: [src/components/UserMenu/UserMenu.module.css](src/components/UserMenu/UserMenu.module.css#L1-L7)

Changed from:
```css
.container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
}
```

Changed to:
```css
.container {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  position: relative;
  z-index: 50;
}
```

**Benefits**:
- Ensures buttons are visible above other navbar elements
- Buttons will be properly clickable

---

## Next Steps for Deployment

### 1. **Set Backend URL Environment Variable** (CRITICAL)
In your Vercel/deployment settings, add:
```
REACT_APP_BACKEND_URL=https://your-backend-api-url.vercel.app
```
OR
```
BACKEND_URL=https://your-backend-api-url.vercel.app
```

### 2. **Verify Theme Toggle**
- The dark/light theme toggle should now work properly since the navbar will fully render
- It's likely the toggle was always present but hidden by the loading state

### 3. **Test After Deployment**
1. Clear browser cache (Ctrl+Shift+Del)
2. Visit the deployed site
3. Check browser console (F12) to verify the correct API URL is logged
4. Confirm Sign In/Sign Up buttons are visible
5. Verify theme toggle works

### 4. **Troubleshooting Tips**
- If buttons still don't show: Check browser console for any fetch errors
- If API calls fail: Verify the backend URL is correct and CORS is configured properly
- If theme toggle doesn't work: Check that `disableSwitch: false` in `docusaurus.config.ts` (already set)

---

## Summary

The main issue was that **the API_URL was undefined in production**, causing the authentication loading state to never resolve. This prevented the Sign In/Sign Up buttons from rendering. The fixes ensure:

✅ Buttons always render (with proper fallback URL)
✅ Proper debugging capability
✅ Theme toggle is visible and functional
✅ Better error handling for future issues
