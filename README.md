# Bulela: Learning that feels you

Bulela is a gamified Bantu language learning platform featuring **Bulela the Honeyguide**. It's designed to make mastering Nyanja and Bemba an immersive, culturally resonant experience using the "Silk & Copper" aesthetic and adaptive AI guidance.

## 🌟 Key Features

- **Adaptive Learning Path**: A dynamic curriculum that adjusts based on your mastery of noun classes and concord rules. Featuring a **Learner Tier** system (MWAYI, CHIKONDI, DOLO) and automated next-lesson selection.
- **Bulela AI Tutor**: A wise, encouraging AI companion powered by Gemini 3.1, providing context-aware guidance, cultural proverbs, and personalized feedback based on your mastery gaps.
- **Sentiment-Aware Learning**: Analyzes learner behavior (flow, friction, boredom) to adjust the difficulty and provide timely **Recommended Actions** (e.g., SHOW_HINT, SIMPLIFY_TASK).
- **Placement Mission**: A 3-step diagnostic mission for new users to determine their initial proficiency tier.
- **Offline-First Sync**: Resilient synchronization that allows you to learn offline and sync your progress when back online.
- **Voice Practice**: High-fidelity speech-to-text for practicing pronunciation and conversational Nyanja.
- **Mastery Tracking**: Detailed metrics for each noun class, ensuring you truly master the "Mirror Rule" (concord), with visual progress charts.

## 🛠️ Tech Stack

### Frontend
- **React 18** with **Vite**
- **Tailwind CSS** for the "Silk & Copper" aesthetic
- **Zustand** for state management
- **Motion (Framer Motion)** for fluid animations
- **Lucide React** for iconography

### Backend
- **Fastify** (High-performance Node.js framework)
- **PostgreSQL** with **Drizzle ORM**
- **Clerk** for secure authentication
- **Zod** for schema validation

### AI & Services
- **Google Gemini API** (Tutor Orchestration)
- **Hugging Face (Gemma)** (Sentiment Analysis)
- **IndexedDB** (Offline Sync Queue)

## 🏗️ Architecture

The project follows a **Clean Architecture** pattern to ensure maintainability and scalability:

- **`/repositories`**: Data access layer using Drizzle ORM.
- **`/services`**: Business logic layer (User management, Sync, AI orchestration).
- **`/server.ts`**: Fastify server with Zod-validated API routes and Vite middleware.
- **`/store`**: Frontend state management with Zustand.
- **`/components`**: Atomic and composite UI components.

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- PostgreSQL database
- Clerk account for authentication
- Gemini API key

### Environment Variables
Create a `.env` file based on `.env.example`:
```env
# Database
DATABASE_URL=postgresql://user:pass@host:port/db

# Authentication (Clerk)
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...

# AI & Services
GEMINI_API_KEY=...
HUGGINGFACE_TOKEN=... # Optional for advanced sentiment analysis
```

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```
The app will be available at `http://localhost:3000`.

### Docker Development

#### Prerequisites
- Docker & Docker Compose installed

#### Quick Start with Docker
```bash
# Copy environment file
cp .env.example .env

# Edit .env with your actual API keys

# Start development environment
npm run docker:dev
```
This will start:
- **App**: http://localhost:3000
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Adminer**: http://localhost:8080 (Database management)

#### Docker Commands
```bash
# Start development environment
npm run docker:dev

# View logs
npm run docker:logs

# Stop containers
npm run docker:down

# Clean up volumes and containers
npm run docker:clean
```

#### Production Deployment
```bash
# Build and start production environment
npm run docker:prod
```

**Note**: For production, ensure you have:
- External PostgreSQL database (Neon recommended)
- SSL certificates in `./ssl/` directory
- Updated `DATABASE_URL` in production environment

### Production Build
```bash
npm run build
npm start
```

## 📜 License
This project is for educational and cultural preservation purposes.
