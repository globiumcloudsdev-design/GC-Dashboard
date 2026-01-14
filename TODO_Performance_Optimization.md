# Lighthouse Performance Optimization Tasks

## High Priority (LCP & Core Web Vitals)
- [ ] Convert HeroSection background image to Next.js Image with priority
- [ ] Replace all `<img>` tags with Next.js `<Image>` components
- [ ] Convert page.js from client to server component
- [ ] Optimize font loading (preload Google Fonts)

## Configuration & Setup
- [ ] Add image optimization settings to next.config.mjs
- [ ] Enable compression and caching in next.config.mjs

## Code Splitting & Loading
- [ ] Implement dynamic imports for heavy components (PortfolioSection, TeamSection)
- [ ] Optimize Framer Motion animations to reduce TBT

## CSS & Assets
- [ ] Inline critical CSS
- [ ] Defer non-critical CSS and JS

## Testing & Validation
- [ ] Run Lighthouse audit to measure improvements
- [ ] Verify no visual changes occurred
