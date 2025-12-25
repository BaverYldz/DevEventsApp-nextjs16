# DevEvent

A modern event discovery platform for developer conferences, meetups, and hackathons.

## Tech Stack

- **Next.js 16.1** - App Router, React Server Components
- **React 19** - Latest React features
- **TypeScript** - Type-safe development
- **Tailwind CSS v4** - Utility-first styling
- **MongoDB + Mongoose** - Database
- **Cloudinary** - Image management
- **PostHog** - Analytics
- **OGL** - WebGL animations

## Setup

1. **Install dependencies:**
```bash
npm install
```

2. **Create `.env` file:**
```env
MONGODB_URI=your_mongodb_uri
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
NEXT_PUBLIC_POSTHOG_KEY=your_posthog_key
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

3. **Run development server:**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Build

**Note for Windows users:** Next.js 16.1.0 uses Turbopack by default, which requires symlink permissions.

**Solution:** Enable Developer Mode in Windows Settings → Privacy & Security → For developers, or run PowerShell as Administrator.

```bash
npm run build
npm start
```

## Deploy to Vercel

1. Import project to Vercel
2. Add environment variables
3. Deploy

Set `NEXT_PUBLIC_BASE_URL` to your production domain.

## Project Structure

```
├── app/              # Next.js App Router
├── components/       # React components
├── database/         # Mongoose models
├── lib/              # Utilities & actions
└── public/           # Static assets
```

## License

MIT
