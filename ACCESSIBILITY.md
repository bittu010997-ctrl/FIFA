# Accessibility Audit Report

This document records the accessibility audit performed across the `stadium-copilot` Next.js application, ensuring WCAG AA compliance and best practices for inclusive design.

## Pages Audited

### 1. `/app/page.tsx` (Landing Page)
- **Contrast**: Confirmed `bg-slate-950` with white text provides a contrast ratio exceeding 4.5:1.
- **Focus States**: Added `focus:ring-4 focus:ring-blue-400 focus:outline-none` to the main "Talk to Copilot" anchor tag so keyboard users have a highly visible focus indicator rather than relying solely on browser defaults.
- **Hierarchy**: Maintained a single `<h1>` tag indicating the top-level structure.

### 2. `/app/copilot/page.tsx` (Fan Chat UI)
- **Semantic HTML & Screen Reader Support**:
  - The chat log uses `<main role="log" aria-live="polite" aria-atomic="false">` so that screen readers dynamically announce new messages as they stream in.
  - Buttons (Send, Mic, Back) feature explicit `aria-label` attributes.
  - The language selector uses an explicitly associated invisible label via `<label htmlFor="language-select" className="sr-only">`.
  - The accessibility checkbox is correctly wired using `<label htmlFor="accessible-toggle">`.
- **Keyboard Navigation**: Added prominent `focus:ring-4` rings across all interactive elements (buttons, inputs, toggles, dropdowns, and links).
- **Color Contrast**: Upgraded secondary text elements (like "You" and "Copilot" tags) from `text-slate-400` to a bolder `text-slate-500 font-bold` to ensure they pass WCAG AA on the light `bg-slate-50` background.

### 3. `/app/staff/page.tsx` (Staff Dashboard)
- **Data Table Semantics**: Live gate data is structured in a semantic `<table>` element, implicitly providing `role="grid"` structure, allowing screen readers to easily navigate the two-dimensional data.
- **Icons & Non-Text Elements**: Home and refresh button SVG icons are wrapped in `<button>` and `<Link>` tags with appropriate `aria-label`s.
- **Color Contrast**: Improved contrast on dark mode subtext by swapping `text-slate-400` to `text-slate-300` on actionable links and adding highly visible `focus:ring-4 focus:ring-indigo-500` outline styles to interactive buttons against the dark background.

## Summary
The application is fully keyboard-navigable and designed with both high-contrast color choices and semantic HTML to support fans and staff relying on assistive technologies.
