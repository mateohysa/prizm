<div align="center">
  <img src="./public/prizm.png" alt="Prizm Logo" width="120" height="120">
  
  # Prizm
  
  **AI-Powered Presentation Builder**
  
  Transform your ideas into beautiful, editable slide decks in seconds with intelligent AI assistance.
  
  [![Next.js](https://img.shields.io/badge/Next.js-15.4-black?style=flat&logo=next.js&logoColor=white)](https://nextjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
  [![React](https://img.shields.io/badge/React-18.2-61DAFB?style=flat&logo=react&logoColor=black)](https://react.dev/)
  [![License](https://img.shields.io/badge/License-MIT-green.svg?style=flat)](LICENSE)
  
</div>

---

##  Overview

Prizm is a modern, AI-assisted presentation builder that bridges the gap between rapid ideation and polished presentations. Simply provide a prompt, and Prizm generates a complete slide deck with intelligent layouts, themed design, and smooth editing capabilities. Whether you're crafting a business pitch, educational content, or creative storytelling, Prizm accelerates your workflow while maintaining full creative control.

##  Key Features

### AI-Powered Content Generation
- **Intelligent Outlines**: Generate presentation structure from natural language prompts
- **Smart Layout Suggestions**: AI-recommended layouts based on content type
- **Asset Generation**: Automated creation of visual elements and content blocks

### Professional Editor
- **Drag-and-Drop Interface**: Intuitive content arrangement with live preview
- **Resizable Layouts**: Flexible grid system with responsive components
- **Rich Content Types**: Text, images, lists, tables, code blocks, callouts, and more
- **Real-time Updates**: Optimistic UI updates for seamless editing experience

### Design System
- **Curated Themes**: Professional color palettes and typography combinations
- **Custom Fonts**: Integrated font library with web-safe and modern typefaces
- **Consistent Styling**: Token-based design system across editor and presentation modes

### Presentation Mode
- **Full-Screen View**: Distraction-free presentation with smooth transitions
- **Precise Scaling**: Adaptive rendering for any screen size
- **Presenter Tools**: Navigation controls and presentation utilities

### Project Management
- **Dashboard**: Visual project browser with thumbnail previews
- **Fast Thumbnails**: Canvas-based thumbnail generation for quick loading
- **Project Organization**: Efficient project management and version tracking

##  Tech Stack

### Frontend
- **Framework**: [Next.js 15](https://nextjs.org/) with App Router
- **UI Library**: [React 18](https://react.dev/) with TypeScript
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Radix UI](https://www.radix-ui.com/)
- **State Management**: 
  - [TanStack Query](https://tanstack.com/query) for server state
  - [Zustand](https://zustand-demo.pmnd.rs/) for client state
- **Drag & Drop**: [react-dnd](https://react-dnd.github.io/react-dnd/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

### Backend
- **Database ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [Clerk](https://clerk.com/)
- **File Uploads**: [Uploadcare](https://uploadcare.com/)
- **AI Providers**: 
  - [OpenAI](https://openai.com/)
  - [Google Gemini](https://ai.google.dev/)
  - [Groq](https://groq.com/)

##  Getting Started

### Prerequisites

- **Node.js** 20.x or higher
- **npm** or **pnpm** or **yarn**
- **Database**: PostgreSQL, MySQL, or SQLite
- API keys for AI providers and services (see Environment Variables)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prizm.git
   cd prizm
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Copy `.env.example` to `.env` and fill in your credentials:
   ```bash
   cp .env.example .env
   ```
   
   See [Environment Variables](#environment-variables) section for details.

4. **Initialize the database**
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```
   
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/prizm"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_SIGN_IN_URL="/sign-in"
NEXT_PUBLIC_CLERK_SIGN_UP_URL="/sign-up"

# AI Providers (at least one required)
OPENAI_API_KEY="sk-..."
GOOGLE_GEMINI_API_KEY="..."
GROQ_API_KEY="gsk_..."

# File Uploads
NEXT_PUBLIC_UPLOADCARE_PUBLIC_KEY="..."
UPLOADCARE_SECRET_KEY="..."

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

See `.env.example` for a complete template.

##  Project Structure

```
prizm/
├── prisma/
│   └── schema.prisma          # Database schema
├── public/                    # Static assets
├── src/
│   ├── actions/              # Server actions (data layer)
│   ├── app/                  # Next.js App Router pages
│   │   ├── (auth)/          # Authentication pages
│   │   ├── (protected)/     # Protected routes
│   │   └── api/             # API routes
│   ├── components/           # React components
│   │   ├── global/          # Application-specific components
│   │   └── ui/              # Reusable UI primitives
│   ├── hooks/               # Custom React hooks
│   ├── lib/                 # Utilities and types
│   │   ├── constants.ts     # App constants
│   │   ├── slideLayouts.ts  # Layout definitions
│   │   ├── types.ts         # Type definitions
│   │   └── utils.ts         # Helper functions
│   ├── store/               # Zustand stores
│   └── middleware.ts        # Auth and routing middleware
└── tailwind.config.ts       # Tailwind configuration
```

##  Security & Privacy

- **Authentication**: All protected routes require authentication via Clerk
- **Authorization**: Server-side checks enforce resource ownership
- **Environment Security**: Sensitive credentials stored in environment variables (never committed)
- **Data Protection**: User data isolated per account with database-level constraints

##  Architecture

### Data Model

- **Projects**: Top-level presentation entities with metadata
- **Slides**: Individual slides containing recursive ContentItem trees
- **ContentItems**: Hierarchical content blocks (text, images, lists, columns, tables, etc.)
- **Themes**: Design tokens controlling typography, colors, and backgrounds

### State Management

- **Server State**: TanStack Query manages API data, caching, and synchronization
- **Editor State**: Zustand stores manage slide editing, prompts, and UI state
- **Optimistic Updates**: Immediate UI feedback with background synchronization

### AI Integration

Multiple AI providers support different use cases:
- **Outline Generation**: Structured presentation planning
- **Content Suggestions**: Context-aware content recommendations
- **Layout Intelligence**: Optimal layout selection based on content type

##  Contributing

Thank you for your interest in Prizm! This project is currently a personal endeavor and **not accepting external contributions** at this time. However, feel free to:

-  Star the repository if you find it useful
-  Report bugs by opening an issue
-  Share feedback and suggestions
-  Fork the project for your own use

##  License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

