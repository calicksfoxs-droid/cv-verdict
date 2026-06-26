# Vercel Frontend Deployment

Deploy the Next.js frontend as a Vercel project.

## Project Settings

- Root directory: `frontend`
- Framework preset: Next.js
- Install command: `npm install`
- Build command: `npm run build`
- Output directory: Vercel default

## Environment Variables

```env
NEXT_PUBLIC_API_URL=https://your-render-backend.onrender.com
```

The value must be the public Render backend URL without a trailing slash.

For the current frontend deployment, Render CORS must include:

```env
CORS_ORIGINS=https://cv-verdict-lilac.vercel.app
```

## Backend CORS Pairing

After Vercel gives the frontend domain, add that domain to Render:

```env
CORS_ORIGINS=https://cv-verdict-lilac.vercel.app
```

The frontend can call only the backend configured in `NEXT_PUBLIC_API_URL`.
