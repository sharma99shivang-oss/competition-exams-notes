# Competition Exams Notes

Production-oriented MERN application for premium competition-exam study notes.

## Start locally

1. Ensure MongoDB is running locally (the default database is `competition_notes`).
2. Run `npm install` from this directory. It installs both applications automatically.
3. Run `npm run seed` to create the demo accounts and starter UPSC content.
4. Run `npm run dev`.

The web app runs at `http://localhost:5173`; the API runs at `http://localhost:5000`.

For deployment, copy `server/.env.example` to `server/.env` and replace the JWT secrets.

Demo accounts:

- Admin: `admin@competitionnotes.com` / `Admin@123456`
- Student: `student@test.com` / `Student@123`

## Production deployment

1. Copy [`server/.env.example`](server/.env.example) to `server/.env`. Set a MongoDB Atlas URI, long JWT secrets, Cloudinary credentials, Razorpay keys and webhook secret. `CLIENT_URL` must be the deployed Vercel origin.
2. Deploy `server` to Render with build command `npm install` and start command `npm start`. Add every server environment variable in Render. Configure Razorpay webhook URL as `https://your-api.onrender.com/api/payments/webhook` and select payment-captured and payment-failed events.
3. Deploy `client` to Vercel. Set `VITE_API_URL=https://your-api.onrender.com/api`, then deploy. Replace the example domain in `client/public/robots.txt` and `sitemap.xml`.

PDFs are never returned in catalogue APIs. The authenticated chapter access endpoint checks a paid order and returns a short-lived Cloudinary signed URL; non-purchasers receive a sample-only signed URL.
