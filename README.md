# HATA Humanitarian Inc. Website

A static website for HATA Humanitarian Inc., a Winnipeg-based non-profit organization promoting mental well-being, supporting addiction recovery, and facilitating social inclusion.

## Quick Start

```bash
npm install
npm start
```

Then open `http://localhost:3000`

## Project Structure

```
/
├── assets/
│   ├── css/
│   │   └── site.css         # Global styles
│   └── js/
│       ├── main.js          # Core JavaScript functionality
│       └── featured-activities.js  # Featured events carousel
├── data/
│   └── featured-activities.json    # Featured events data
├── images/                   # Image assets
├── index.html               # Homepage
├── donate.html              # Donation page
├── Contact.html             # Contact page
├── Partners.html            # Partners page
├── podcasts.html            # Podcasts page
├── updates.html             # Updates hub
├── newcomer.html            # Newcomer program
├── mental-health-support.html  # Mental health program
├── addiction-recovery.html  # Addiction recovery program
├── server.js                # Node.js static server
├── sitemap.xml              # SEO sitemap
└── robots.txt               # Search engine directives
```

## Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Accessibility**: Skip links, ARIA labels, keyboard navigation
- **SEO Optimized**: Meta tags, sitemap, semantic HTML
- **Security Headers**: CSP, XSS protection, rate limiting
- **Featured Events**: Dynamic carousel for announcements

## Pages

- **Home** (`/`): Landing page with hero, programs, team, and partners
- **Programs**: Mental health, newcomer integration, addiction recovery
- **Podcasts** (`/podcasts`): Roots & Oases podcast page
- **Contact** (`/contact`): Contact information and FAQs
- **Partners** (`/partners`): Partner organizations and opportunities
- **Donate** (`/donate`): Donation options
- **Updates** (`/updates`): Updates hub

## API Endpoints

- `GET /api/health` - Health check
- `GET /api/featured-activities` - Get featured events
- `POST /api/contact` - Submit contact form (rate limited)

## Development

The site uses:
- **Tailwind CSS** (CDN) for styling
- **Font Awesome** for icons
- **Google Fonts** (Playfair Display, Lato)
- **Vanilla JavaScript** for interactivity

## Deployment

The site can be deployed to:
- Any static hosting (Vercel, Netlify, GitHub Pages)
- Node.js hosting (Heroku, Railway, DigitalOcean)

For static deployment, serve the HTML files directly.
For dynamic features (contact form), use the Node.js server.

## License

© 2026 HATA Humanitarian Inc. All rights reserved.

## Contact

- Website: [hatahumanitarian.org](https://www.hatahumanitarian.org)
- Email: info@hatahumanitarian.org
- LinkedIn: [HATA Humanitarian](https://www.linkedin.com/company/humanitarian-aid-through-advocacy-hata/)
