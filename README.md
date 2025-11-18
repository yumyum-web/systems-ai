# Systems AI

A Next.js application that uses Google's Gemini API to provide expert advice on system architecture and design for developers and system architects.

## Features

- **Chat Interface**: Clean, minimal interface with a sidebar for chat history
- **Material-UI Design**: Modern, responsive design using Material-UI components
- **Gemini AI Integration**: Powered by Google's Gemini Pro model
- **Multiple Chats**: Support for multiple conversation threads
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices

## Getting Started

### Prerequisites

- Node.js 18+ installed
- A Google Gemini API key

### Installation

1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

2. Configure your API key:
   - Open `.env.local` file in the root directory
   - Replace `your_api_key_here` with your actual Gemini API key:
     ```
     GEMINI_API_KEY=your_actual_api_key_here
     ```

3. Install dependencies (if not already done):
   ```bash
   npm install
   ```

### Running the Application

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. Type your question about system architecture, design patterns, or best practices in the input field
2. Press Enter or click the send button
3. The AI will respond with expert advice
4. Create new chats using the "New Chat" button in the sidebar
5. Switch between different conversation threads by clicking on them in the sidebar

## Example Questions

- "What's the best architecture for a scalable microservices system?"
- "How should I design a real-time notification system?"
- "What are the pros and cons of event-driven architecture?"
- "How do I choose between SQL and NoSQL databases?"
- "Explain the CAP theorem and its implications for distributed systems"

## Technologies Used

- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Material-UI (MUI)**: UI component library
- **Google Generative AI**: Gemini Pro model
- **React Hooks**: State management

## Project Structure

```
systems-ai-minimal/
├── app/
│   ├── api/
│   │   └── chat/
│   │       └── route.ts      # API endpoint for Gemini
│   ├── page.tsx              # Main chat interface
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── .env.local                # Environment variables
├── package.json
└── README.md
```

## Important Notes

- This is a demonstration project not intended for production deployment
- Keep your API key secure and never commit it to version control
- The `.env.local` file is gitignored to protect your API key
- API usage may incur costs depending on your Google Cloud billing

## License

This project is for demonstration purposes only.
