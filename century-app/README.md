# century - incentivized personal diary

century is a minimalist incentivized diary app designed to help you build a journaling habit through a clean interface and simple gamification elements.

## Features

- **Minimal Interface**: Clean, distraction-free writing environment
- **Motivation Features**: Streaks, badges, and a visual calendar to track your progress
- **Photo Support**: Add photos to your entries to capture moments
- **Memory Flashbacks**: "On This Day" feature to revisit past entries

## Development

Century is built with:

- [Tauri](https://tauri.app/) - lightweight, secure desktop app framework
- [React](https://reactjs.org/) - UI library
- [TypeScript](https://www.typescriptlang.org/) - type-safe JavaScript
- [Styled Components](https://styled-components.com/) - CSS-in-JS styling

## Getting Started

### Prerequisites

- Node.js 16+
- Rust (for Tauri backend)

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd century

# Install dependencies
npm install

# Start development server
npm run tauri dev
```

### Building for Production

```bash
npm run tauri build
```

This will generate platform-specific binaries in the `src-tauri/target/release` directory.

## Project Structure

- `src/` - Frontend React code
  - `components/` - UI components
  - `services/` - Data and business logic
  - `assets/` - Images and static files
- `src-tauri/` - Rust backend code

## License

MIT
