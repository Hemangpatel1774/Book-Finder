# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Deploying to Vercel

This project is ready for deployment to Vercel. The repository includes a `vercel.json` that tells Vercel to run the build and serve the Vite `dist` output as a static site, and rewrites all routes to `index.html` so the SPA works correctly.

Quick steps to deploy:

1. Commit and push your code to GitHub/GitLab/Bitbucket.
2. Go to https://vercel.com and import the repository.
3. Vercel will detect a static site. Set the build command to `npm run build` (the default) and the output directory to `dist` (configured in `vercel.json`).
4. Click Deploy — after the build completes your app will be live.

Local verification before deploy:

```bash
npm install
npm run build
npm run preview
```

If the preview shows your app correctly, you're ready to deploy.

If you want automatic environment variables or a custom domain, configure those in the Vercel dashboard after the first deploy.
