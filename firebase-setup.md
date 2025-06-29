# Firebase Setup Guide for Multiplayer Battleship 🔥

To enable multiplayer functionality, you'll need to set up a Firebase project. Follow these steps:

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" (or "Add project")
3. Enter a project name (e.g., "battleship-multiplayer")
4. Choose whether to enable Google Analytics (optional)
5. Click "Create project"

## Step 2: Set up Realtime Database

1. In your Firebase project console, click "Realtime Database" in the left sidebar
2. Click "Create Database"
3. Choose "Start in test mode" (you can change this later)
4. Select a location close to your users
5. Click "Done"

## Step 3: Get Your Firebase Configuration

1. In your Firebase project, click the ⚙️ (Settings) icon
2. Click "Project settings"
3. Scroll down to "Your apps" section
4. Click the web icon (</>) to add a web app
5. Enter an app nickname (e.g., "battleship-web")
6. Click "Register app"
7. Copy the Firebase configuration object

## Step 4: Update Your Game Code

Replace the demo Firebase configuration in `index.html` with your real configuration:

```javascript
// Replace this section in index.html
const firebaseConfig = {
    apiKey: "your-api-key",
    authDomain: "your-project.firebaseapp.com",
    databaseURL: "https://your-project-default-rtdb.firebaseio.com",
    projectId: "your-project-id",
    storageBucket: "your-project.appspot.com",
    messagingSenderId: "123456789",
    appId: "your-app-id"
};
```

## Step 5: Configure Database Rules (Optional but Recommended)

For better security, you can update your database rules:

1. Go to "Realtime Database" → "Rules" tab
2. Replace the default rules with:

```json
{
  "rules": {
    "rooms": {
      "$roomId": {
        ".read": true,
        ".write": true,
        ".indexOn": ["createdAt"]
      }
    }
  }
}
```

## Step 6: Deploy to GitHub Pages

1. Push your updated `index.html` to your GitHub repository
2. Go to your repository settings
3. Scroll down to "Pages" section
4. Select "Deploy from a branch"
5. Choose "main" branch and "/ (root)" folder
6. Click "Save"
7. Your game will be available at `https://yourusername.github.io/repositoryname`

## Security Considerations

⚠️ **Important**: The current setup uses test mode which allows anyone to read/write data. For production use:

1. Set up Firebase Auth for user authentication
2. Update database rules to restrict access
3. Consider adding rate limiting

## Troubleshooting

### Common Issues:

1. **"Firebase failed to load"**: Check your internet connection and Firebase CDN links
2. **"Permission denied"**: Check your database rules
3. **"Room not found"**: Ensure both players are using the same room code
4. **Connection issues**: Check your Firebase project settings and database URL

### Testing Locally:

1. Open `index.html` in two different browser tabs
2. Create a room in one tab
3. Join the room in the other tab using the room code
4. Both players should see "Both players connected!"

## Features Included:

✅ Real-time multiplayer gameplay  
✅ Room creation and joining with codes  
✅ Synchronized ship placement  
✅ Turn-based attacks  
✅ Win/loss detection  
✅ Connection status indicators  
✅ Automatic reconnection handling  

## Cost:

Firebase offers a generous free tier that includes:
- 100 simultaneous connections
- 1GB data transfer per month
- 10GB storage

This is more than enough for a personal game project!

---

**Need help?** Check the [Firebase Documentation](https://firebase.google.com/docs/web/setup) for more detailed instructions. 