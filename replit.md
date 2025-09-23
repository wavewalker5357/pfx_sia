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
- **Session-based**: Express sessions for maintaining user state
- **Role-based Features**: Different UI components and capabilities based on user role

### Data Storage
- **Primary Database**: PostgreSQL with connection pooling via Neon serverless
- **ORM**: Drizzle with schema-first approach and automatic TypeScript generation
- **Schema Design**: 
  - Ideas table for submissions with metadata
  - Users table for admin authentication
  - Summit resources table for manageable external links
- **Development Storage**: In-memory storage interface for testing and development

### UI/UX Design System
- **Color Palette**: Custom HSL-based color system with semantic tokens
- **Typography**: Inter font family with weight variations for hierarchy
- **Component Library**: Comprehensive set of accessible components built on Radix UI
- **Responsive Design**: Mobile-first approach with Tailwind breakpoints
- **Theme Support**: Light/dark mode with CSS custom properties

### Key Features
- **Idea Submission**: Structured form with categorization, tagging, and validation
- **Idea Browser**: Filterable grid view with search and category filtering
- **Analytics Dashboard**: Real-time charts and statistics using Recharts
- **Admin Panel**: Content management, user activity monitoring, and data export
- **Summit Resources**: Admin-managed external links dropdown

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