# Classwiser

A modern, intuitive note-taking application designed for students and professionals who want to capture, organize, and revisit lectures and meetings. Classwiser combines real-time speech recognition with a powerful rich-text editor, all synced with AI-powered audio playback.

## What is Classwiser?

Think of Classwiser as your intelligent lecture companion. You can:

- **Record lectures** using your browser's speech recognition (no setup required)
- **Capture transcripts** in real-time as you listen
- **Create formatted notes** with headers, bullet points, code blocks, and quotes
- **Playback audio** of your notes using AI-powered text-to-speech
- **Export everything** to beautifully formatted PDFs

Whether you're sitting in a classroom, attending a virtual meeting, or learning from a tutorial, Classwiser helps you stay organized and focused.

## Features

### Dual-View Interface
- **Notes Tab**: Create and organize structured notes with multiple block types
- **Transcript Tab**: View and edit your live lecture transcription

### Smart Recording
- One-click recording that captures your lecture in real-time
- Automatic transcription using the browser's Web Speech API
- Resume recording without losing previous content

### Rich Text Formatting
- Paragraphs, headings, bullet points, block quotes, and code blocks
- Inline formatting with bold, italic, underline, strikethrough, and highlights
- Live preview as you type

### Block-Based Notes
Each note is a block, so you can:
- Move blocks up and down to reorganize
- Change block types on the fly
- Delete blocks individually
- Add new blocks anywhere

### Audio Playback
- Convert any text to speech using Murf AI's natural-sounding voices
- Playback your notes to reinforce learning
- Perfect for reviewing key concepts

### Export to PDF
- Export your complete notes and transcript
- Beautiful, print-ready formatting
- Preserve all formatting and structure

## Getting Started

### Prerequisites
- Node.js and npm installed on your system
- A modern browser with Web Speech API support (Chrome, Edge, Safari)

### Installation

1. Clone or download the project
2. Install dependencies for both frontend and backend:

```bash
# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
```

3. Set up environment variables in the backend folder:

```bash
# Create a .env file in the backend folder
cp .env.example .env
```

Then edit `backend/.env` and add your Murf AI API key:
```
MURF_API_KEY=your_actual_murf_api_key_here
```

### Running the App

1. Start the backend server:
```bash
cd backend
node server.js
```
The server runs on `http://localhost:5000`

2. In another terminal, start the frontend:
```bash
npm start
```
The app opens at `http://localhost:3000`

## Project Structure

```
lecture-ai/
├── src/
│   ├── App.jsx          # Main React component
│   ├── App.css          # Styling
│   └── index.js         # Entry point
├── backend/
│   └── server.js        # Express API server
├── public/              # Static assets
└── package.json         # Dependencies
```

## How It Works

### Frontend
- Built with React for a smooth, responsive user interface
- Uses the Web Speech API for real-time transcription
- Manages notes as an array of blocks with different types
- Communicates with the backend API for text-to-speech conversion

### Backend
- Express.js server handling API requests
- Connects to Murf AI's speech synthesis API
- Generates audio files from transcript text
- Returns audio URLs for playback

## Tech Stack

- **Frontend**: React, JavaScript, CSS3
- **Backend**: Node.js, Express.js
- **APIs**: Murf AI (text-to-speech), Web Speech API (speech-to-text)
- **Export**: PDF generation with custom HTML styling

## Tips for Best Results

1. **Recording**: Use a quiet environment for better transcription accuracy
2. **Formatting**: As you take notes, use different block types to organize information clearly
3. **Transcripts**: Edit the transcription as needed if the AI missed something
4. **Audio Playback**: Great for reviewing key sections—set a slower speaking pace if you prefer
5. **Exporting**: Generate PDFs regularly to create backups of your notes

## Browser Compatibility

- Chrome/Edge (Chromium-based): Full support
- Safari: Full support
- Firefox: Works, but speech recognition may be limited

## Limitations

- Speech recognition works best with English
- Requires internet connection for text-to-speech
- Audio transcription accuracy depends on audio quality and background noise

## Future Ideas

- Support for multiple languages
- Cloud sync across devices
- Collaborative note-taking
- Integration with calendar and email
- Custom voice selection for playback

## License

This project is open for personal and educational use.

---

**Made for students, by someone who knows the struggles of lecture notetaking.**
