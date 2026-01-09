# Product Requirements Document (PRD): Scratchpad

## 1. Goal
Provide a simple, distraction-free, and persistent note-taking environment that saves automatically and requires no login.

## 2. Core Features
- **Instant Note-Taking**: Users can start typing immediately upon landing.
- **Auto-Save**: Changes are saved to browser `localStorage` as you type (debounced).
- **Persistence**: Notes remain across sessions and page refreshes.
- **Theme Toggle**: Support for Light and Dark modes with persistent preference.
- **Multi-tab Sync**: Changes made in one tab are instantly reflected in other open tabs of the same app.
- **Save Indicator**: Visual feedback showing when changes are "Saving..." or "Saved".

## 3. Design Principles
- **Minimalism**: Clean interface inspired by Coda's design system.
- **Typography**: Focused on readability, using **DM Sans** for all text elements.
- **Reliability**: Zero data loss for local sessions.

## 4. Technical Stack
- **Framework**: Next.js (App Router)
- **Language**: TypeScript
- **Styling**: Vanilla CSS (Global variables)
- **Storage**: Browser `localStorage` API
- **Fonts**: Next.js Font optimization (Google Fonts)

## 5. Deployment
- **Platform**: Vercel (Continuous Deployment via GitHub)
