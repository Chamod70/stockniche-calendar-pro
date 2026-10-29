# StockNiche Calendar Pro

Intelligent calendar, event discovery, seasonal trend research, and commercial stock-content planning platform designed specifically for Adobe Stock contributors.

## Features

- **Master Calendar & Event Explorer**: Year/Month/Week/Day calendar with global and regional commercial events, lead-time calculations, and opportunity scores.
- **AI & Hybrid Niche Finder**: Discover high-demand Adobe Stock niches (Vectors, Stock Photography, 3D Renders, Stock Video) with explainable opportunity scoring.
- **Prompt Studio**: Generate copy-ready generative prompts tailored for Adobe Stock submission standards.
- **Keyword & Metadata Assistant**: SEO titles, categorized keyword clusters, and forbidden tag checks.
- **Seasonal Planner & Kanban Board**: Manage contributor production sprints, checklists, and export CSV/JSON reports.

## Deploy on Vercel

This repository is pre-configured for one-click deployment on **Vercel**:

1. Import `Chamod70/stockniche-calendar-pro` in [Vercel](https://vercel.com/new).
2. Vercel will automatically detect **Vite** (`npm run build`, output directory `dist`) and Serverless API routes (`/api/*` via `vercel.json`).
3. *(Optional)* In Vercel **Project Settings → Environment Variables**, add:
   - `GEMINI_API_KEY` = your Google Gemini API key (if omitted, the built-in algorithmic engine will automatically handle niche, prompt, and keyword generation).
4. Click **Deploy**.

## Run Locally

1. Install dependencies:
   ```bash
   npm install
   ```
2. *(Optional)* Create a `.env` file and set your Gemini API key:
   ```env
   GEMINI_API_KEY=your_api_key_here
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
