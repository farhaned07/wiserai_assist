# Wiser AI Assistant

A cutting-edge AI assistant optimized for Bangladesh, featuring bilingual support (Bangla and English) powered by the DeepSeek API.

## Features

- Modern, responsive UI with dark/light mode
- Bilingual support (Bangla/English)
- AI-powered chat with DeepSeek
- Categorized conversations
- Responsive design for all devices
- Rounded, modern UI design
- Optimized API usage with caching and throttling

## Setup and Installation

### Prerequisites

- Node.js 18+ installed
- DeepSeek API key (get one from https://platform.deepseek.com/)

### Environment Variables

1. Create a `.env.local` file in the root directory
2. Add your DeepSeek API key:
   ```
   DEEPSEEK_API_KEY=your_deepseek_api_key_here
   ```
3. Replace `your_deepseek_api_key_here` with your actual DeepSeek API key
4. Verify your environment setup by running:
   ```
   npm run check-env
   ```
   This will check if all required environment variables are properly set.

### Local Development

1. Clone this repository
2. Install dependencies:
   ```
   npm install
   ```
3. Set up environment variables as described above
4. Run the development server:
   ```
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Deployment

### Prerequisites

- Vercel account
- DeepSeek API key

### Steps to Deploy

1. Clone this repository
2. Set up environment variables in Vercel:
   - `DEEPSEEK_API_KEY`: Your DeepSeek API key
3. Deploy to Vercel using the Vercel CLI or GitHub integration

## Troubleshooting

### Missing DeepSeek API Key

If you see an error message about a missing DeepSeek API key:

1. Make sure you have created a `.env.local` file in the root directory
2. Ensure the file contains your DeepSeek API key in the format:
   ```
   DEEPSEEK_API_KEY=your_actual_api_key_here
   ```
3. Restart the development server after adding the API key
4. Run `npm run check-env` to verify your environment setup

## API Call Optimization

This application includes several optimizations to reduce the number of API calls made to the DeepSeek service:

### Server-Side Optimizations

1. **Enhanced Caching System**
   - 24-hour cache retention for responses (up from 1 hour)
   - Increased cache size to 200 entries (up from 100)
   - MD5 hash-based cache keys for efficient storage and retrieval

2. **Request Throttling**
   - Limits users to 10 requests per minute
   - Prevents excessive API usage and potential costs
   - Automatically cleans up old throttling data

3. **Request Deduplication**
   - Tracks in-flight requests to prevent duplicate API calls
   - Multiple identical requests share a single API call
   - Reduces redundant processing and API usage

### Client-Side Optimizations

1. **Input Debouncing**
   - 300ms delay before processing input changes
   - Prevents API calls during rapid typing
   - Reduces unnecessary state updates

2. **Local Storage Caching**
   - Stores recent conversations in browser's local storage
   - Restores chat history without API calls on page reload
   - Limits storage to 20 most recent messages

### Setup for Optimization

To ensure all optimizations are properly configured:

1. Run the setup script to install required dependencies:
   ```
   npm run setup
   ```

2. Restart your development server:
   ```
   npm run dev
   ```

3. Monitor your API usage in the DeepSeek dashboard to verify reduced calls

