# 🎮 Block Puzzle Game

A modern, responsive block puzzle game built with pure HTML, CSS, and JavaScript. Play the classic falling blocks game on any device!

## 🚀 Live Demo

**Play Now:** [https://kingsyah.github.io/bloklist/](https://kingsyah.github.io/bloklist/)

## ✨ Features

### 🎯 Game Features
- **Classic Gameplay** - Traditional block puzzle mechanics
- **7 Unique Pieces** - All classic block shapes (I, O, T, S, Z, J, L)
- **Progressive Difficulty** - Speed increases with level
- **Score System** - Points for lines cleared, soft drops, and hard drops
- **Next Piece Preview** - See what's coming next
- **Pause/Resume** - Take breaks anytime
- **Game Over Detection** - Automatic game end when blocks reach top

### 📱 Cross-Platform Support
- **Desktop Controls** - Keyboard support (Arrow keys, WASD, Space)
- **Mobile Touch** - Optimized touch controls for smartphones
- **Tablet Friendly** - Responsive design for all screen sizes
- **Modern Browsers** - Works on Chrome, Firefox, Safari, Edge

### 🎨 Modern Design
- **Gradient Backgrounds** - Beautiful visual aesthetics
- **Smooth Animations** - Fluid piece movements and transitions
- **Responsive Layout** - Adapts to any screen size
- **Mobile-First** - Optimized for mobile gameplay
- **Clean UI** - Minimalist, distraction-free interface

## 🎮 How to Play

### Desktop Controls
- **↑ / W** - Rotate piece
- **← / A** - Move left
- **→ / D** - Move right
- **↓ / S** - Soft drop (faster fall)
- **Space** - Hard drop (instant drop)

### Mobile Controls
- **↻** - Rotate piece
- **←** - Move left
- **→** - Move right
- **↓** - Soft drop
- **DROP** - Hard drop

### Game Rules
1. **Clear Lines** - Fill horizontal lines to clear them
2. **Score Points** - Earn points for cleared lines and drops
3. **Level Up** - Every 10 lines cleared increases level and speed
4. **Avoid Top** - Game ends when pieces reach the top

## 🛠️ Technical Details

### Built With
- **HTML5** - Semantic markup and Canvas API
- **CSS3** - Modern styling with Flexbox and Grid
- **Vanilla JavaScript** - No frameworks or dependencies
- **Canvas 2D** - Smooth graphics rendering

### Browser Compatibility
- ✅ Chrome 60+
- ✅ Firefox 55+
- ✅ Safari 12+
- ✅ Edge 79+
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Features
- **60 FPS Gameplay** - Smooth animations using requestAnimationFrame
- **Optimized Rendering** - Efficient canvas drawing
- **Touch Optimization** - Haptic feedback and visual responses
- **Memory Efficient** - Clean code with proper garbage collection

## 📁 Project Structure

```
block-puzzle-game/
├── index.html          # Main HTML file
├── style.css           # Responsive CSS styles
├── script.js           # Game logic and controls
└── README.md           # Project documentation
```

## 🚀 Getting Started

### Option 1: Play Online
Visit [https://kingsyah.github.io/bloklist/](https://kingsyah.github.io/bloklist/) to play instantly!

### Option 2: Run Locally
1. **Clone or Download** this repository
2. **Open** `index.html` in your web browser
3. **Start Playing** - No installation required!

### Option 3: Serve Locally
```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Using PHP
php -S localhost:8000
```

Then visit `http://localhost:8000`

## 📱 Mobile Optimization

### Touch Controls
- **Large Touch Targets** - 44px minimum for iOS compliance
- **Haptic Feedback** - Vibration on supported devices
- **Visual Feedback** - Button press animations
- **Gesture Prevention** - Disabled zoom, selection, context menus

### Responsive Design
- **Mobile-First** - Optimized for small screens
- **Safe Areas** - Support for iPhone notch and home indicator
- **Viewport Units** - Dynamic viewport height (dvh) support
- **Orientation** - Works in both portrait and landscape

## 🎨 Customization

### Colors
The game uses CSS custom properties for easy theming:
- Primary gradient: `#667eea` to `#764ba2`
- Game pieces: 7 distinct colors for each piece type
- UI elements: Modern blue and orange gradients

### Difficulty
Adjust game speed in `script.js`:
```javascript
const dropInterval = Math.max(50, 1000 - (level - 1) * 100);
```

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Ideas for Contributions
- 🎵 Sound effects and background music
- 🏆 High score persistence (localStorage)
- 🎨 Theme customization options
- 🎮 Additional game modes
- 📊 Statistics tracking
- 🌐 Internationalization (i18n)

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**KingSyah**
- 🌐 Website: [https://kingsyah.github.io/bloklist/](https://kingsyah.github.io/bloklist/)
- 📧 Contact: [Create an issue](../../issues) for questions or suggestions

## 🙏 Acknowledgments

- Inspired by the classic block puzzle game mechanics
- Built with modern web technologies for optimal performance
- Designed with mobile-first responsive principles
- Optimized for accessibility and user experience

---

**© 2025 KingSyah** - Made with ❤️ for puzzle game enthusiasts

*Enjoy the game and happy puzzling! 🧩*
