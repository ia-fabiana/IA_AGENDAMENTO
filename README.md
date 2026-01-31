<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/drive/1kAeFkfoyjjXABDmDwPHcZzjpnSS-wHZO

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env.local` (required)
3. Set the `VITE_GEMINI_API_KEY` in `.env.local` to your Gemini API key (required for AI chat)
4. Set the `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in `.env.local` (required for data sync)
5. Set `VITE_EVOLUTION_API_URL` and `VITE_EVOLUTION_API_KEY` to enable WhatsApp connection (optional)
6. Run the app:
   `npm run dev`
