# AI Summit Collaboration Platform

## Overview

This is a collaborative idea submission platform designed for the Product & Engineering Summit 2025. The application enables attendees to submit AI-related ideas, stories, and solutions, while providing organizers with analytics and administrative tools to manage submissions and track engagement.

The platform features a modern, responsive design inspired by productivity tools like Linear and Notion, with a focus on clean data visualization and user-friendly interfaces. It supports both light and dark themes and includes password-protected access for different user roles.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system following "New York" style
- **Forms**: React Hook Form with Zod validation for type-safe form handling

### Backend Architecture
- **Server**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful endpoints with JSON responses
- **Development**: Hot reload with Vite middleware integration

### Authentication & Authorization
- **Multi-tier Access**: Password-based authentication with three access levels:
  - Public (password-protected attendee access)
  - Admin (username/password protected administrative access)
  - No access (landing page only)
- **Client-Side Authentication**: Currently uses sessionStorage with hardcoded credentials
  - Attendee password: `summit2025`
  - Admin credentials: `admin` / `admin123`
- **Role-based Features**: Different UI components and capabilities based on user role

**⚠️ Security Limitation**: This is a prototype/demo application with **client-side-only authentication**. Backend API endpoints are not protected by server-side authentication middleware. All admin routes (including DELETE /api/ideas, form field management, settings updates, etc.) can be accessed directly without authentication. This design is suitable for trusted environments or demonstrations but should not be used in production without implementing proper server-side authentication (express-session, passport, JWT, etc.).

### Data Storage
- **Primary Database**: PostgreSQL with connection pooling via Neon serverless
- **ORM**: Drizzle with schema-first approach and automatic TypeScript generation
- **Schema Design**: 
  - Ideas table for submissions with metadata
  - Users table for admin authentication
  - Summit resources table for manageable external links
  - Form fields table for custom field configurations with multi-select support
  - Idea dynamic fields table for storing user-submitted values (one row per value for multi-select)
- **Multi-Select Implementation**: 
  - Custom dropdown fields can be configured as multi-select in admin panel
  - Each selected value stored as separate row in ideaDynamicFields for accurate statistics
  - UI displays multiple values as individual badges
  - Supports both single and multi-select modes for list-type fields
- **Development Storage**: In-memory storage interface for testing and development

### UI/UX Design System
- **Color Palette**: Custom HSL-based color system with semantic tokens
- **Typography**: Inter font family with weight variations for hierarchy
- **Component Library**: Comprehensive set of accessible components built on Radix UI
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Theme Support**: Light/dark mode with CSS custom properties
  - **Default Theme**: Light mode (ignores browser/OS dark mode preference)
  - **Theme Toggle**: Manual theme switching via toggle button in header
  - **Header Theming**: Header background adapts to theme (white in light mode, dark zinc-900 in dark mode)
  - **Theme Persistence**: User preference saved in localStorage

### Key Features
- **Idea Submission**: Structured form with categorization, tagging, and validation
- **Idea Browser**: Filterable grid view with search and category filtering
- **Analytics Dashboard**: Real-time charts and statistics using Recharts
- **Admin Panel**: Content management, user activity monitoring, and data export
- **Summit Resources**: Admin-managed external links dropdown
- **Custom Form Fields**: 
  - Admin-configurable dynamic fields with multiple types (text, textarea, dropdown)
  - Multi-select dropdown support for custom list fields
  - Field ordering control with drag-and-drop
  - User-addable options for dropdown fields
  - Complete database reset functionality for fresh starts

## External Dependencies

### Database & Backend Services
- **@neondatabase/serverless**: PostgreSQL database connection for serverless environments
- **drizzle-orm & drizzle-kit**: Type-safe ORM with schema management and migrations
- **connect-pg-simple**: PostgreSQL session store for Express sessions

### UI & Component Libraries
- **@radix-ui/***: Comprehensive set of accessible, unstyled UI primitives
- **@tanstack/react-query**: Server state management and data fetching
- **recharts**: Chart library for analytics visualizations
- **embla-carousel-react**: Carousel component for UI interactions

### Form Handling & Validation
- **react-hook-form**: Performance-focused form library
- **@hookform/resolvers**: Validation resolvers for React Hook Form
- **zod**: Runtime type validation and schema definition
- **drizzle-zod**: Integration between Drizzle schemas and Zod validation

### Styling & Design
- **tailwindcss**: Utility-first CSS framework
- **class-variance-authority**: Type-safe variant management for components
- **clsx**: Conditional className utility
- **cmdk**: Command palette component

### Development Tools
- **vite**: Fast build tool and development server
- **typescript**: Static type checking
- **@replit/vite-plugin-runtime-error-modal**: Development error handling
- **@replit/vite-plugin-cartographer**: Development tooling for Replit environment

### Utility Libraries
- **date-fns**: Date manipulation and formatting
- **nanoid**: Unique ID generation for sessions and data
- **lucide-react**: Icon library with React components