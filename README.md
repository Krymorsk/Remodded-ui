# FORM — Functional GitHub Pages build

This build is a static, offline-first FORM demo using only:

- HTML
- CSS
- Vanilla JavaScript

No build step, Node.js, React, TypeScript, or backend is required.

## Features

- Mobile-first glassmorphism UI
- Home dashboard
- Workout screen with exercise completion
- Follow-along workout modal
- Weight adjustment + rest timer
- Progress screen with weight trend
- Training modes: Normal / Bulk / Comeback
- Height and weight saved locally
- Workout history and streak calculations
- Data stored with `localStorage`

## GitHub Pages

1. Create a repository.
2. Upload `index.html`, `style.css`, `app.js`, and `README.md` to the repo root.
3. GitHub: **Settings → Pages → Deploy from branch**.
4. Choose `main` and `/ (root)`.
5. Open the generated Pages URL.

For a project URL such as `username.github.io/FORM`, the files use relative `./` paths so the app still loads.

This follows the existing FORM project direction: the app is intended to be client-only and to keep user data in the browser. 
