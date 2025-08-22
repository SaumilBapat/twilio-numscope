# Twilio Phone Number Chatbot

A conversational interface to help users find the most suitable Twilio phone number for their specific use case. The chatbot collects user requirements and provides personalized recommendations based on compliance needs and technical requirements.

## Features

- **Conversational Flow**: Step-by-step questionnaire to gather user requirements
- **Twilio Branding**: Follows official Twilio brand guidelines and color scheme
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Smart Recommendations**: Provides tailored phone number type suggestions
- **Compliance Guidance**: Includes relevant compliance information for each recommendation

## Requirements Collected

The chatbot gathers the following information:

1. **SMS Type**: 1-way or 2-way SMS capabilities
2. **Use Case**: Primary purpose (marketing, support, authentication, etc.)
3. **Business Presence**: Local presence in destination country
4. **Timeline**: Preferred provisioning timeline
5. **Message Volume**: Expected daily message volume
6. **Voice Calls**: Whether voice functionality is required

## Recommendation Types

Based on user inputs, the chatbot recommends:

- **Local Phone Numbers**: For users with local business presence needing voice
- **Toll-Free Numbers**: For users without local presence requirements
- **Short Codes**: For high-volume messaging campaigns

## Technology Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS with custom Twilio brand tokens
- **Components**: shadcn/ui component library
- **TypeScript**: Full type safety throughout the application

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn package manager

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd twilio-chatbot
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Copy the environment file:
\`\`\`bash
cp .env.example .env.local
\`\`\`

4. Configure your environment variables (see `.env.example`)

5. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

\`\`\`bash
npm run build
npm start
\`\`\`

## API Integration

The chatbot is designed to integrate with your backend API. Update the `generateRecommendation` function in `app/page.tsx` to call your actual API endpoint:

\`\`\`typescript
const generateRecommendation = async (responses: Record<string, string>) => {
  const response = await fetch('/api/recommendations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(responses)
  })
  
  const data = await response.json()
  return data.recommendation
}
\`\`\`

## Customization

### Branding

The application uses Twilio's official brand colors defined in `app/globals.css`. To modify:

- **Primary Color**: `--primary` (Twilio Red #F22F46)
- **Secondary Color**: `--secondary` (Emerald Green #10b981)
- **Background**: `--background` (White #FFFFFF)

### Questions

Modify the `questions` array in `app/page.tsx` to customize the questionnaire flow.

### Recommendations Logic

Update the `generateRecommendation` function to implement your specific business logic and API integration.

## Deployment

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

## Support

For technical support or questions about this implementation, please contact your development team or create an issue in the repository.

## License

This project is proprietary software developed for Twilio phone number provisioning.
# twilio-numscope
