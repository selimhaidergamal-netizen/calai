# HealthAI LifePlanner

A sophisticated, full-stack health and fitness tracking application with AI-powered insights powered by Google's Gemini API. Track your daily nutrition, set fitness goals, and receive personalized recommendations based on your health journey.

## Features

### 📊 Daily Tracking
- **Calorie Intake Logging**: Track daily food and dietary entries with precise calorie counts
- **Meal Type Classification**: Categorize entries as breakfast, lunch, dinner, or snack
- **Daily Summary**: View total calories consumed and entry count at a glance
- **Notes & Metadata**: Add optional notes to each food entry for context

### 📈 Food Entry History
- **Filterable Log**: Browse past entries with flexible date range filtering
- **Daily Aggregation**: View daily totals and trends over time
- **Entry Management**: Delete or modify past entries as needed
- **Historical Analysis**: Track eating patterns across weeks and months

### 🎯 Fitness Goal Management
- **Goal Setting**: Define target weight, desired body type, and timeline
- **Personal Notes**: Add motivation and specific focus areas
- **Goal Tracking**: Monitor progress toward your fitness objectives
- **Dynamic Updates**: Modify goals as your journey evolves

### 🤖 AI-Powered Insights
- **Gemini Integration**: Leverages Google's Gemini 3 Flash API for analysis
- **Personalized Analysis**: Generates insights based on your specific data and goals
- **Actionable Recommendations**: Receives specific, practical suggestions for improvement
- **Trend Analysis**: Identifies eating patterns and progress toward objectives

### 🔐 Security & Privacy
- **User Authentication**: Manus OAuth integration for secure login
- **Per-User Data Scoping**: Each user's data is completely isolated and private
- **Protected Routes**: All features require authentication
- **Secure API**: tRPC with protected procedures for data access

## Tech Stack

### Frontend
- **React 19** with TypeScript
- **Tailwind CSS 4** for elegant, responsive design
- **shadcn/ui** components for consistent UI
- **tRPC** for type-safe API communication
- **Wouter** for lightweight routing
- **Framer Motion** for smooth animations

### Backend
- **Express.js** server
- **tRPC** for type-safe RPC procedures
- **Drizzle ORM** for database management
- **MySQL/TiDB** database
- **Google Gemini API** for AI analysis

### Infrastructure
- **Vite** for fast development and builds
- **Vitest** for unit testing
- **pnpm** for package management
- **Manus OAuth** for authentication

## Getting Started

### Prerequisites
- Node.js 22.x or higher
- pnpm package manager
- MySQL/TiDB database

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/lifeplanner.git
   cd lifeplanner
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Create a `.env` file with:
   ```
   DATABASE_URL=your_database_url
   JWT_SECRET=your_jwt_secret
   VITE_APP_ID=your_app_id
   OAUTH_SERVER_URL=your_oauth_url
   BUILT_IN_FORGE_API_KEY=your_api_key
   BUILT_IN_FORGE_API_URL=your_api_url
   ```

4. **Run database migrations**
   ```bash
   pnpm drizzle-kit generate
   pnpm drizzle-kit migrate
   ```

5. **Start development server**
   ```bash
   pnpm dev
   ```

The application will be available at `http://localhost:3000`

## Project Structure

```
lifeplanner/
├── client/                 # React frontend
│   ├── src/
│   │   ├── pages/         # Page components (Today's Log, History, Goals, AI Insights)
│   │   ├── components/    # Reusable UI components
│   │   ├── lib/           # Utilities and tRPC client
│   │   └── index.css      # Global styles with design tokens
│   └── index.html
├── server/                # Express backend
│   ├── routers.ts         # tRPC procedure definitions
│   ├── db.ts              # Database query helpers
│   └── _core/             # Core server infrastructure
├── drizzle/               # Database schema and migrations
├── shared/                # Shared types and constants
└── package.json
```

## Key Features Implementation

### Food Tracking
- Form validation with Zod
- Real-time calorie summaries
- Optimistic UI updates
- Error handling with toast notifications

### Goal Management
- Form-based goal creation and updates
- Visual goal display with progress indicators
- Timeline and body type customization

### AI Insights
- Gemini API integration for analysis
- Configurable analysis window (1-30 days)
- Error handling for API failures
- Markdown rendering of insights

## Database Schema

### Users
- Manus OAuth integration
- Role-based access control (user/admin)
- Profile information

### Food Entries
- User-scoped entries
- Calorie tracking
- Meal type classification
- Optional notes
- Date tracking

### Fitness Goals
- User-specific goals
- Target weight and body type
- Timeline in months
- Personal notes

### AI Analyses
- Generated insights
- Timestamp tracking
- User-scoped storage

## API Endpoints (tRPC)

### Food Management
- `food.create` - Add new food entry
- `food.delete` - Remove food entry
- `food.getDailyLog` - Get entries for specific date
- `food.getHistory` - Get entries for date range

### Goal Management
- `goal.get` - Retrieve user's current goal
- `goal.createOrUpdate` - Create or update fitness goal

### AI Insights
- `ai.generateInsights` - Generate Gemini-powered analysis
- `ai.getLatest` - Retrieve latest analysis

## Design System

The application features an elegant, refined design with:
- **Color Palette**: Purple accent (oklch(0.55 0.2 262)) with neutral backgrounds
- **Typography**: System fonts with careful hierarchy
- **Spacing**: Consistent 0.75rem border radius and responsive padding
- **Components**: shadcn/ui with Tailwind customization
- **Animations**: Smooth 200-300ms transitions

## Testing

Run the test suite:
```bash
pnpm test
```

## Deployment

The application is optimized for Manus deployment with:
- Autoscale serverless hosting
- Custom domain support
- Automatic SSL certificates
- Environment variable management

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests: `pnpm test`
4. Commit with clear messages
5. Push and create a pull request

## License

MIT License - See LICENSE file for details

## Support

For issues, questions, or suggestions, please open an issue on GitHub.

## Acknowledgments

- Built with [Manus](https://manus.im) full-stack template
- UI components from [shadcn/ui](https://ui.shadcn.com)
- AI powered by [Google Gemini](https://gemini.google.com)
