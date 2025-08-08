# Vibe Avatars 🌟

A 3D world built with Babylon.js where players can customize multiple avatars and use them to decorate houses, stores, and offices. Experience immersive avatar customization and world building in your browser!

## 🎮 Features

- **Avatar System**: Spawn and control multiple customizable avatars
- **Character Controller**: WASD movement with physics-based interactions
- **Gizmo Manager**: Intuitive 3D manipulation tools for object positioning, rotation, and scaling
- **Asset Librarian**: Library of furniture, decorations, and building assets
- **Interactive 3D World**: Physics-enabled environment with collision detection
- **GitHub Pages Deployment**: Automatically deployed and accessible online

## 🚀 Quick Start

### Play Online
Visit the live demo: [https://dpwhittaker.github.io/vibe-avatars/](https://dpwhittaker.github.io/vibe-avatars/)

### Run Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/dpwhittaker/vibe-avatars.git
   cd vibe-avatars
   ```

2. Serve the files using a local web server:
   ```bash
   # Using Python 3
   python -m http.server 8000
   
   # Using Node.js http-server
   npx http-server
   
   # Using PHP
   php -S localhost:8000
   ```

3. Open your browser and navigate to `http://localhost:8000`

## 🎯 Controls

| Key/Action | Function |
|------------|----------|
| **WASD** | Move selected avatar |
| **Space** | Avatar jump |
| **Mouse** | Look around/rotate camera |
| **Click** | Select objects in the scene |
| **Spawn Avatar** | Create a new avatar |
| **Toggle Gizmos** | Enable/disable object manipulation tools |
| **Load Asset** | Add random furniture/decoration to the scene |

## 🏗️ Architecture

The application is built with a modular architecture:

### Core Modules

- **`main.js`** - Application initialization and main loop
- **`character-controller.js`** - Avatar spawning, selection, and movement
- **`gizmo-manager.js`** - 3D object manipulation tools
- **`asset-librarian.js`** - Asset loading and management system

### Technology Stack

- **Babylon.js** - 3D rendering engine
- **Cannon.js** - Physics simulation
- **ES6 Modules** - Modern JavaScript module system
- **GitHub Pages** - Static site hosting
- **GitHub Actions** - Automated deployment

## 🎨 Asset System

The Asset Librarian includes several categories:

### Furniture
- Chairs with realistic proportions
- Tables with various sizes
- Interactive furniture pieces

### Decorations
- Trees with procedural generation
- Lamps with dynamic lighting
- Customizable decorative items

### Buildings
- Houses with modular components
- Scalable architecture pieces

## 🔧 Development

### Project Structure
```
vibe-avatars/
├── index.html              # Main HTML file
├── js/                     # JavaScript modules
│   ├── main.js            # Application entry point
│   ├── character-controller.js
│   ├── gizmo-manager.js
│   └── asset-librarian.js
├── assets/                 # 3D models and textures
│   ├── models/
│   └── textures/
├── .github/workflows/      # CI/CD configuration
└── README.md
```

### Adding New Assets

1. **Primitive Assets**: Add new creation functions to `asset-librarian.js`
2. **3D Models**: Place `.babylon`, `.glb`, or `.obj` files in `assets/models/`
3. **Textures**: Add image files to `assets/textures/`

### Extending Character Controller

The character controller supports:
- Multiple avatar instances
- Physics-based movement
- Keyboard input handling
- Avatar selection system

### Customizing Gizmo Manager

Modify gizmo behavior:
- Enable/disable specific gizmo types
- Adjust gizmo scaling and appearance
- Add custom manipulation tools

## 🌐 Deployment

The project automatically deploys to GitHub Pages when changes are pushed to the main branch. The deployment workflow:

1. Checks out the code
2. Configures GitHub Pages
3. Uploads the site content
4. Deploys to the Pages environment

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test locally
5. Commit your changes: `git commit -m 'Add feature'`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎪 Future Enhancements

- [ ] Avatar customization UI (clothing, colors, accessories)
- [ ] Save/load world states
- [ ] Multiplayer support
- [ ] Advanced physics interactions
- [ ] Custom asset upload system
- [ ] VR/AR support
- [ ] Sound effects and ambient audio
- [ ] Weather and day/night cycles

## 🐛 Issues & Support

If you encounter any issues or have suggestions, please [create an issue](https://github.com/dpwhittaker/vibe-avatars/issues) on GitHub.

---

Built with ❤️ using Babylon.js
