# DevEvent - AI Coding Agent Instructions

## Project Overview
DevEvent is a Next.js 16.1 event discovery platform for developer conferences, meetups, and hackathons. Built with React 19, TypeScript, Tailwind CSS v4, and MongoDB (Mongoose).

## Tech Stack & Configuration

### Core Framework
- **Next.js 16.1** with App Router, React Server Components (RSC), and React Compiler enabled
- **TypeScript** with strict mode, path aliases via `@/*` (maps to root)
- **Tailwind CSS v4** with inline theme configuration in [app/globals.css](app/globals.css)
- Turbopack caching enabled for dev mode (`turbopackFileSystemCacheForDev: true`)

### Key Dependencies
- **OGL (ogl)**: WebGL library powering the custom [LightRays.tsx](components/LightRays.tsx) background component
- **Mongoose**: MongoDB ODM (installed, but no schemas/models implemented yet)
- **PostHog**: Analytics with EU instance, configured via [instrumentation-client.ts](instrumentation-client.ts) and rewrites in [next.config.ts](next.config.ts)
- **shadcn/ui**: UI component library configured for "new-york" style with Lucide icons
- **Custom fonts**: Schibsted Grotesk (body) and Martian Mono (monospace) from Google Fonts

## Development Workflow

### Commands
```bash
npm run dev    # Start dev server (localhost:3000)
npm run build  # Production build
npm run lint   # ESLint check
```

### File Structure Patterns
- **App Router**: Pages in `app/` directory (currently only [page.tsx](app/page.tsx) homepage)
- **Components**: Reusable React components in `components/` (EventCard, Navbar, LightRays)
- **Utilities**: [lib/utils.ts](lib/utils.ts) exports `cn()` for Tailwind class merging
- **Constants**: [lib/constants.ts](lib/constants.ts) contains `events` array (static event data)
- **Assets**: Icons in `public/icons/`, images in `public/images/`

## Code Conventions

### Component Patterns
1. **Naming**: Use PascalCase for components, lowercase for page exports (e.g., `const home = () => {}`)
2. **Props**: Define explicit `interface Props` for typed components
3. **Client Components**: Mark with `"use client"` directive only when using hooks/browser APIs (LightRays)
4. **Image Optimization**: Always use `next/image` with explicit width/height

Example from [EventCard.tsx](components/EventCard.tsx):
```tsx
interface Props {
    title: string;
    image: string;
    slug: string;
    // ...
}
const EventCard = ({ title, image, slug }: Props) => (
    <Link href={`/events${slug}`}>
        <Image src={image} alt={title} width={410} height={300} />
    </Link>
)
```

### Styling
- **Tailwind-first**: Use utility classes, avoid custom CSS unless necessary
- **CSS Variables**: Defined in [globals.css](app/globals.css) under `:root` (e.g., `--color-blue`, `--primary`)
- **Custom Animations**: tw-animate-css library imported in globals.css
- **Font Variables**: Applied via className: `${SchibstedGrotesk.variable} ${MartianMono.variable}`

### Data Management
- Event data currently lives in [lib/constants.ts](lib/constants.ts) as static objects
- Mongoose is installed but not yet integrated - no models/schemas exist
- When adding database functionality, create models in `lib/models/` or `models/` directory

## Special Integrations

### LightRays Background
- WebGL-powered animated background using OGL library
- Configured in [layout.tsx](app/layout.tsx) with specific props (raysOrigin, raysColor, followMouse, etc.)
- Positioned absolutely with `z-[-1]` to stay behind content
- Performance-optimized with intersection observer and cleanup logic

### PostHog Analytics
- Client-side init in [instrumentation-client.ts](instrumentation-client.ts)
- Requires `NEXT_PUBLIC_POSTHOG_KEY` environment variable
- Proxy configured via rewrites in [next.config.ts](next.config.ts) to `/ingest/*` → `https://eu.i.posthog.com/*`
- Exception tracking enabled in production

## Known Patterns & Gotchas

1. **Environment Variables**: PostHog key must be prefixed with `NEXT_PUBLIC_` for client access
2. **Event Links**: Currently broken - uses `/events${slug}` but should be `/events/${slug}` (missing slash)
3. **Static Data**: Events array is hardcoded; plan to migrate to Mongoose when implementing CRUD
4. **Font Loading**: Uses `next/font/google` with CSS variables for consistent typography
5. **Trailing Slashes**: Disabled redirects (`skipTrailingSlashRedirect: true`) for PostHog API compatibility

## Next Steps (Typical Development Tasks)

- Implement Mongoose schemas for Event model and database connection
- Create dynamic event detail pages using `app/events/[slug]/page.tsx`
- Add event creation form (route exists in Navbar but not implemented)
- Set up environment variable management (`.env.local` template)
- Fix EventCard link formatting bug
