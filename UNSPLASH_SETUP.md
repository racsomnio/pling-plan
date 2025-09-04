# Unsplash API Setup Guide

## Getting Your Unsplash API Key

1. **Go to [Unsplash Developers](https://unsplash.com/developers)**
2. **Sign in or create an account**
3. **Click "New Application"**
4. **Fill in the application details:**
   - Application name: "Pling Plan" (or any name you prefer)
   - Description: "Travel planning app for city images"
   - What are you building: "Web application"
5. **Accept the terms and create the application**
6. **Copy your Access Key (Client ID)**

## Setting Up Environment Variables

1. **Create a `.env.local` file in your project root**
2. **Add your Unsplash API key:**

```bash
UNSPLASH_ACCESS_KEY=your_actual_api_key_here
```

3. **Restart your development server** (`npm run dev`)

## How It Works

- The app now uses **only Unsplash** for city images
- No more Picsum Photos or placeholder images
- High-quality, curated photos for each city
- Proper attribution to photographers
- Better search results with city-specific queries

## Troubleshooting

If you see errors like:
- "Unsplash API key not configured"
- "Failed to fetch image from Unsplash"

**Check:**
1. Your `.env.local` file exists
2. The API key is correct
3. You've restarted the dev server
4. Your Unsplash application is approved

## API Limits

- **Demo applications**: 50 requests per hour
- **Production applications**: 5000 requests per hour
- **Rate limiting**: Respects Unsplash's fair use policy

## Example API Response

```json
{
  "image": {
    "url": "https://images.unsplash.com/photo-...",
    "alt": "Beautiful city view of Paris",
    "photographer": "John Doe",
    "unsplashUrl": "https://unsplash.com/photos/..."
  }
}
```
