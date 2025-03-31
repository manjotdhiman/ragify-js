# Ragify.js Documentation Site

[![Deploy to GitHub Pages](https://github.com/manjotdhiman/ragify-js/actions/workflows/deploy-docs.yml/badge.svg)](https://github.com/manjotdhiman/ragify-js/actions/workflows/deploy-docs.yml)

This is the documentation site for Ragify.js, built with Nextra.

## Development

```bash
# Install dependencies
yarn install

# Start development server
yarn dev

# Build for production
yarn build

# Export static site
yarn export

# Start production server
yarn start
```

## Project Structure

```
docs-site/
├── app/                    # Next.js app directory
│   └── layout.jsx         # Root layout component
├── pages/                 # Documentation pages
│   ├── _meta.json        # Navigation configuration
│   ├── index.mdx         # Home page
│   ├── getting-started.mdx
│   ├── core-concepts.mdx
│   └── configuration.mdx
├── theme.config.jsx      # Nextra theme configuration
└── next.config.mjs       # Next.js configuration
```

## Adding New Pages

1. Create a new `.mdx` file in the `pages` directory
2. Add the page to `_meta.json` for navigation
3. Use MDX features like:
   - Code blocks with syntax highlighting
   - Mermaid diagrams
   - Custom components
   - Tabs and callouts

## Deployment

The documentation site is automatically deployed to GitHub Pages when changes are pushed to the main branch.

### Manual Deployment

1. Build and export the site:
   ```bash
   yarn export
   ```

2. The static site will be available in the `out` directory

### Automated Deployment

The site is automatically deployed via GitHub Actions when changes are pushed to the main branch. The workflow:

1. Builds the static site
2. Deploys to GitHub Pages
3. Makes the site available at: https://manjotdhiman.github.io/ragify-js/

### Setup Requirements

To enable GitHub Pages deployment:

1. Go to your repository settings
2. Navigate to Pages
3. Set the source to "GitHub Actions"
4. Ensure the repository has the following permissions enabled:
   - `contents: read`
   - `pages: write`
   - `id-token: write`

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT © [Manjot Singh](https://github.com/manjotdhiman) 