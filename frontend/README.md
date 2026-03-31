# AI Math Chatbot - Frontend

This is the **frontend** for the AI Math Chatbot application, built with Next.js, React, TypeScript, and Tailwind CSS. It provides a modern, accessible, and responsive user interface for interacting with the AI-powered math assistant.

## 🌟 Key Features

- **Interactive chat interface** with AI Math Assistant (streaming responses)
- **File uploads** (PDF, images, text files, Word documents) with preview and removal (**up to 5 files at once**)
- **Voice input** via microphone (Whisper integration)
- **Chat history management** (multi-turn, persistent)
- **Responsive design** with light/dark mode
- **Accessible UI** (WCAG 2.1 AA, semantic HTML, keyboard navigation)
- **LaTeX/Math rendering** (KaTeX)
- **State management** with Zustand

## 🧑‍💻 Modern Engineering & Best Practices

- **TypeScript** for type safety and maintainability
- **Tailwind CSS** for utility-first, responsive styling
- **shadcn/ui** for accessible, composable UI components
- **Zustand** for scalable state management
- **API integration** with FastAPI backend (see [main README](../README.md))
- **Accessibility (A11y):** Semantic HTML, ARIA attributes, keyboard navigation, color contrast
- **Performance:** Code splitting, optimized assets, minimal bundle size

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Backend API running (see backend setup in [main README](../README.md))
- API keys for Gemini and Whisper (for the backend)

### Installation

1. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

2. Create a `.env.local` file in the frontend directory:

```
# Backend API URL
NEXT_PUBLIC_API_BASE_URL=http://localhost:8000
```

3. Run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔗 Connecting to the Backend

The frontend communicates with the backend API using endpoints such as:

- `/chats`, `/chats/{chat_id}`: Chat history management
- `/chats/{chat_id}/stream`: Streaming chat responses
- `/upload-file`: File upload (up to 5 files per request)
- `/stt`: Speech-to-text

See [project-structure.md](../project-structure.md) for a full directory breakdown.

## 🛠️ API Integration & Architecture

- `lib/api-service.ts`: Core API functions for chat, file uploads (up to 5 files), and speech-to-text
- `lib/api-config.ts`: API configuration
- `lib/store.ts`: Zustand store with backend integration
- `components/`: Modular, accessible React components (chat, sidebar, markdown, etc.)
- `hooks/`: Custom React hooks for UI and state logic

## 🧪 Testing

**Note:** Frontend tests will be implemented in a later stage. The project is structured for easy test integration using:

- `jest` and `react-testing-library` for component and integration tests
- Playwright or Cypress for end-to-end user flow testing

## 🏗️ Project Structure

See [project-structure.md](../project-structure.md) for a detailed breakdown of the frontend and overall project layout.

## 🛠️ Production Build

```bash
npm run build
# or
yarn build
# or
pnpm build
```

## 🚢 Deployment

The frontend can be deployed to platforms like Vercel, Netlify, or any service that supports Next.js applications.

- Set `NEXT_PUBLIC_API_BASE_URL` to your production backend API URL.

## 🔮 Future Considerations

- **Calculator UI:** Add a calculator with basic and scientific modes
- **Graphs and Charts:** Interactive graphing and charting from user data
- **Canvas Drawing:** Draw and annotate math expressions, geometry, and graphs
- **Mobile App:** React Native or PWA for mobile devices
- **Advanced Accessibility:** Further improvements for screen readers and cognitive accessibility
- **Multilingual UI:** Support for multiple languages
- **Plugin System:** Allow users to extend the chatbot with custom UI plugins
- **Unit/Integration/E2E Testing:** Add comprehensive automated tests

---

**Showcase your frontend engineering skills:** This project is designed to be a portfolio-quality, production-grade example of modern AI web application development. Contributions and feedback are welcome! 