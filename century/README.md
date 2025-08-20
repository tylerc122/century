# Century

Century is a minimal, sleek diary application built with Tauri and React. It's designed to be a simple yet powerful tool for journaling with features like light/dark mode, image support, and streak tracking.

## Features

- **Minimalist Design**: Clean, modern interface with minimal animations
- **Two Main Screens**: Diary entries list and profile page
- **Light/Dark Mode**: Toggle between themes for comfortable use day and night
- **Image Support**: Add images to your diary entries
- **On This Day**: See entries from past years on the same day
- **Streak Tracking**: Stay motivated with streak tracking and statistics

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Rust](https://www.rust-lang.org/) (for Tauri)
- [Tauri CLI](https://tauri.app/v1/guides/getting-started/prerequisites)

### Setup

1. Clone the repository
2. Install dependencies

```bash
npm install
```

3. Run the development server

```bash
npm run tauri dev
```

### Building

To build the app for production:

```bash
npm run tauri build
```

## Tech Stack

- **Frontend**: React, TypeScript, Styled Components
- **Backend**: Tauri, Rust
- **Storage**: Tauri Plugin Store (local file-based storage)

## Project Structure

- `/src` - React frontend code
  - `/components` - UI components
  - `/services` - Data services
  - `/theme` - Theme configuration
  - `/types` - TypeScript type definitions
- `/src-tauri` - Rust/Tauri backend code
