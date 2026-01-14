# Performance Optimization TODO

## 1. HeroSection Optimization
- [x] Convert HeroSection to pure Server Component (remove "use client")
- [x] Remove all framer-motion code and animations
- [x] Replace CSS background-image with next/image component
- [x] Use WebP image (/images/bg.webp) with priority and fetchPriority="high"
- [x] Ensure hero renders immediately on server

## 2. Framer Motion Below Fold
- [x] Confirm PortfolioSection and TeamSection use dynamic import with ssr: false
- [x] Move any above-fold framer-motion usage to below-fold components

## 3. Image Optimization
- [x] Replace <img> in ProjectCard.jsx with next/image
- [x] Replace <img> in TeamCard.jsx with next/image
- [x] Replace <img> in PortfolioSection.jsx with next/image
- [ ] Replace <img> in ProjectFormDialog.jsx with next/image
- [ ] Replace <img> in TeamFormDialog.jsx with next/image
- [ ] Replace <img> in projects/[slug]/page.jsx with next/image
- [ ] Convert images to WebP where possible
- [ ] Add correct sizes attribute to all next/image components
- [ ] Lazy-load non-critical images

## 4. JavaScript Optimization
- [ ] Ensure only critical JS runs on initial render
- [ ] Split bundles aggressively (confirm dynamic imports)

## 5. Page Structure
- [ ] Confirm page.tsx remains Server Component
