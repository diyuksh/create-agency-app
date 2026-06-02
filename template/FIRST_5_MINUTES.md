# The First 5 Minutes

Welcome to your new Agency App! Here is exactly what you should do in the next 5 minutes to avoid blank canvas paralysis:

1. **Check Environment Variables**
   - Look at `.env.local.example` (and `.env.local` if it exists).
   - Fill in your API keys for Sanity, Shopify, or Marketing tools.

2. **Customize the Branding**
   - Open `src/app/globals.css` or `tailwind.config.ts` and change the primary colors to match your client's brand.
   - Replace `public/logo.png` (or SVG) with your agency's/client's logo.

3. **Start the Dev Server**
   - Run `npm run dev` (or `bun dev` / `pnpm dev`).
   - Navigate to http://localhost:3000 to see your setup.

4. **Review Analytics and SEO**
   - Check `src/app/sitemap.ts` and `src/app/robots.ts`.
   - Update `metadata` in `src/app/layout.tsx` to match the project name.

You're ready to build something incredible. 🚀
