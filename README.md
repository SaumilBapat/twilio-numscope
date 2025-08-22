# Twilio Phone Number Assistant

An AI-powered conversational interface that helps users find the most suitable Twilio phone number for their specific use case. The assistant provides personalized recommendations with detailed compliance and regulatory guidance through an intelligent chat interface.

## Features

- **AI-Powered Chat Interface**: Natural language conversation with Twilio Assistant
- **Smart Filtering Sidebar**: Advanced filters for SMS type, use case, business presence, timeline, volume, and voice requirements
- **Real-Time Recommendations**: Dynamic phone number suggestions based on conversation context
- **Detailed Number Information**: Modal dialogs with comprehensive details about considerations and restrictions
- **Multi-Country Support**: Global phone number recommendations with local compliance guidance
- **Responsive Design**: Split-panel layout optimized for desktop and mobile
- **Dark/Light Theme Toggle**: User preference theme switching

## How It Works

### Chat Interface
Users describe their phone number requirements in natural language. The AI assistant:
1. Analyzes requirements and asks clarifying questions
2. Considers regulatory compliance for target countries
3. Provides contextual recommendations with detailed explanations
4. Maintains conversation history for better context

### Smart Filtering
The sidebar allows users to filter recommendations by:
- **SMS Type**: 1-way or 2-way SMS capabilities  
- **Use Case**: Marketing, support, authentication, notifications
- **Business Presence**: Local presence in destination country
- **Timeline**: ASAP, 1-2 days, 1-3 weeks, 6-12 weeks
- **Expected Volume**: Low (<1k/day), Medium (1k-10k/day), High (10k-100k/day), Very High (>100k/day)
- **Voice Calls**: Required or not required
- **Countries**: Multi-select country picker with search

### Recommendation Display
Recommended numbers are shown with:
- **Geographic Location**: Target country/region
- **Number Type**: Local, Toll-Free, 10DLC, etc.
- **Capabilities**: SMS and Voice support indicators
- **Detailed Information**: Click "View More" for considerations and restrictions

## Technology Stack

- **Framework**: Next.js 15 with App Router and Turbopack
- **UI Library**: Twilio Paste Design System (@twilio-paste/core)
- **Styling**: CSS-in-JS with Paste theme tokens
- **AI Integration**: External API for intelligent recommendations
- **TypeScript**: Full type safety throughout the application
- **State Management**: React hooks for local state
- **Icons**: Twilio Paste icon library

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or pnpm package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd twilio-chatbot
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
# or
pnpm install
\`\`\`

3. Configure environment variables:
\`\`\`bash
# Create .env.local file with your API configuration
QA_API_URL=https://your-api-endpoint.com/api/qa/simple
QA_API_URL_FALLBACK=https://your-fallback-endpoint.com/api/qa/simple
QA_API_BEARER=your-api-bearer-token
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3001](http://localhost:3001) in your browser (or the port shown in terminal)

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## API Integration

### Environment Variables

The application requires these environment variables:

- `QA_API_URL`: Primary API endpoint for phone number recommendations
- `QA_API_URL_FALLBACK`: Fallback API endpoint (optional)  
- `QA_API_BEARER`: Bearer token for API authentication

### API Response Format

The recommendation API should return:

\`\`\`typescript
{
  "answer": "AI-generated response text",
  "recommendedNumbers": [
    {
      "geo": "US",
      "type": "10DLC", 
      "smsEnabled": true,
      "voiceEnabled": true,
      "considerations": "Requires A2P 10DLC registration...",
      "restrictions": "Marketing campaigns must have explicit opt-in..."
    }
  ],
  "latency": 2500,
  "sourcesUsed": {
    "csvDocuments": ["doc-id-1"],
    "urls": ["url1", "url2"]
  }
}
\`\`\`

## Customization

### Theming

The application uses Twilio Paste Design System with built-in theme support:
- **Light Theme**: Default Twilio branding with clean white backgrounds
- **Dark Theme**: Dark mode variant with consistent brand colors
- **Theme Toggle**: Users can switch themes via the floating toggle button

### Filter Options

Modify filter options in `app/page.tsx`:
- Add new use cases to the `useCase` select options
- Update volume ranges in the `volume` field
- Customize timeline options

### Conversation Flow

The AI handles natural conversation flow, but you can:
- Modify the initial greeting message
- Customize the prompt formatting in `/api/qa/simple/route.ts`
- Add additional context fields to be sent to the API

## Deployment

### Environment Variables Setup

Before deploying, ensure these environment variables are configured:

```bash
QA_API_URL=https://your-production-api.com/api/qa/simple
QA_API_URL_FALLBACK=https://your-fallback-api.com/api/qa/simple
QA_API_BEARER=your-production-bearer-token
NEXT_TELEMETRY_DISABLED=1
```

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Configure environment variables in Vercel dashboard
4. Deploy automatically on push to main branch

### Other Platforms

The application can be deployed to any platform that supports Next.js:

- Netlify
- AWS Amplify
- Railway
- DigitalOcean App Platform

### Build Configuration

The app uses Next.js 15 with Turbopack. For production builds:
- Turbopack is enabled for faster development
- Environment variables are loaded from `.env`, `.env.local`, etc.
- API routes are automatically deployed as serverless functions

## Features in Detail

### Chat Interface
- **Natural Language Processing**: Understands complex phone number requirements
- **Context Awareness**: Maintains conversation history for better recommendations
- **Real-time Responses**: Streaming-like interface with loading indicators
- **Error Handling**: Graceful error messages with retry capabilities

### Recommendations Panel
- **Dynamic Filtering**: Real-time filtering based on conversation context
- **Detailed Modals**: Comprehensive information about each number type
- **Responsive Design**: Adapts to screen size with collapsible panels
- **Empty States**: Helpful messaging when no recommendations are available

### Security
- **Environment Variables**: Sensitive API credentials stored securely
- **API Proxy**: Backend API calls to protect credentials from client
- **CORS Handling**: Proper cross-origin request management

## Support

For technical support or questions about this implementation, please contact your development team or create an issue in the repository.

## License

This project is proprietary software developed for Twilio phone number provisioning.
