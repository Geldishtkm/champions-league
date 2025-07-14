# Champions League Fantasy League

Welcome to the Champions League Fantasy League project! This is a fun web app where you can build your own fantasy football team, manage your squad, and play guessing games with real player stats.

## Features
- **Player List**: Browse and search for football players.
- **Add Players**: Add your favorite players to your team or bench.
- **Starting XI**: Build your best lineup and manage your squad.
- **Player Guesser**: Test your knowledge with a true/false guessing game about player stats.
- **Login**: Secure your session with a username and password (Basic Auth).

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [npm](https://www.npmjs.com/)
- A running backend server (Spring Boot, see backend instructions)

### Setup
1. **Install dependencies**
   ```sh
   cd vite-project
   npm install
   ```
2. **Start the frontend**
   ```sh
   npm run dev
   ```
   The app will be available at [http://localhost:5173](http://localhost:5173)

3. **Start the backend**
   Make sure your backend is running at [http://localhost:8080](http://localhost:8080) and supports HTTP Basic Auth.

4. **Login**
   - Use your backend credentials (e.g., `admin` / `secret`) to log in.

## Project Structure
- `src/` - Main source code (components, pages, styles)
- `public/` - Static assets (images, icons)
- `assets/` - App images and logos
- `App.jsx` - Main app component

## Notes
- This project is for learning and fun! Feel free to customize, add features, or improve the UI.
- If you find any bugs or have ideas, open an issue or send a pull request.

---

**Enjoy building your dream team!**

*Made with ❤️ by a football fan.*
