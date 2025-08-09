# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `pnpm dev` - Start the development server with hot module replacement
- `pnpm build` - Build the application for production (runs TypeScript compilation followed by Vite build)
- `pnpm lint` - Run ESLint to check for code quality issues
- `pnpm preview` - Preview the production build locally

## Technology Stack & Architecture

This is a React + TypeScript + Vite application with the following key technologies:

- **Frontend Framework**: React 19.1.1 with TypeScript
- **Build Tool**: Vite with SWC for fast compilation
- **Styling**: TailwindCSS v4 with shadcn/ui component system
- **Component Library**: Lucide React for icons, shadcn/ui components
- **Package Manager**: pnpm (based on pnpm-lock.yaml)

## Project Structure

- `src/App.tsx` - Main application component (currently a basic Vite + React template)
- `src/main.tsx` - Application entry point
- `src/lib/utils.ts` - Utility functions including `cn()` for combining Tailwind classes
- `src/index.css` - Global styles with TailwindCSS imports and custom CSS variables for theming
- `components.json` - shadcn/ui configuration with New York style and component aliases
- `vite.config.ts` - Vite configuration with path aliases (`@` → `./src`)

## Code Style Guidelines (from .cursor/rules)

When writing code in this project, follow these conventions:

- Use early returns for better readability
- Use TailwindCSS classes exclusively for styling (avoid inline CSS)
- Use descriptive variable and function names with "handle" prefix for event handlers
- Implement proper accessibility features (tabindex, aria-label, etc.)
- Prefer `const` over `function` declarations with explicit types when possible
- Follow DRY principles and write complete, functional code

## UI Component System

The project uses shadcn/ui components with:
- New York style variant
- TailwindCSS integration with CSS variables for theming
- Support for dark/light themes via CSS custom properties
- Component aliases configured for easy imports (`@/components/ui`, `@/lib/utils`)

## Development Notes

- The application currently contains basic Vite + React boilerplate code
- ESLint is configured with React hooks and TypeScript support
- TailwindCSS v4 is configured with custom theme variables and dark mode support
- No test framework is currently configured