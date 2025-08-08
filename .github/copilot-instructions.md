# Copilot Instructions for Vibe Avatars

This repository contains a browser-based 3D avatar system and interactive world builder. The project enables users to customize avatars and decorate virtual environments using modern web technologies.

## Project Overview

**Vibe Avatars** is a complete 3D world platform featuring:
- Avatar spawning and customization system
- Interactive object manipulation with gizmo controls
- Asset library with procedural generation (furniture, decorations, buildings)
- Real-time character movement and physics simulation
- Cross-platform support for desktop and mobile devices

## Architecture

The project uses a modular JavaScript architecture:

### Core Modules
- `main.js` - Babylon.js integration and application initialization
- `character-controller.js` - Avatar management and movement system
- `gizmo-manager.js` - 3D object manipulation tools
- `asset-librarian.js` - Asset creation and management system
- `demo-app.js` - Standalone CSS3/JavaScript demo implementation

### Key Technologies
- **Babylon.js** - 3D rendering engine for advanced scenarios
- **ES6 Modules** - Modern JavaScript module system
- **CSS3 Transforms** - Fallback 3D rendering for demo
- **GitHub Pages** - Automated deployment pipeline

## Development Guidelines

### Code Style
- Use ES6+ features and modern JavaScript patterns
- Maintain modular architecture with clear separation of concerns
- Follow consistent naming conventions (camelCase for variables/functions)
- Include comprehensive error handling and user feedback
- Write self-documenting code with meaningful variable names

### Mobile Compatibility
- Implement responsive design principles
- Add touch event handlers for mobile interactions
- Provide virtual controls for touch devices
- Ensure smooth performance across device types
- Test on various screen sizes and orientations

### User Experience
- Prioritize intuitive controls and clear visual feedback
- Implement smooth animations and transitions
- Provide helpful tooltips and instructions
- Maintain consistent visual design language
- Support both keyboard and touch inputs

### Asset Management
- Generate assets procedurally when possible
- Implement efficient asset loading and caching
- Support multiple asset types (avatars, furniture, decorations)
- Provide customization options for generated content
- Maintain performance with large numbers of objects

## File Structure

```
vibe-avatars/
├── .github/
│   └── workflows/          # GitHub Actions CI/CD
├── js/                     # Core JavaScript modules
├── index.html             # Main landing page
├── demo.html              # Interactive demo
└── README.md              # Project documentation
```

## Common Tasks

### Adding New Avatar Features
- Extend `character-controller.js` for movement mechanics
- Update avatar generation in `demo-app.js`
- Add corresponding UI controls in demo.html
- Test cross-platform compatibility

### Implementing New Assets
- Add creation functions to `asset-librarian.js`
- Include randomization options for variety
- Ensure assets work with gizmo manipulation
- Update UI to include new asset types

### Mobile Enhancements
- Add touch event handlers to relevant modules
- Implement virtual control schemes
- Test gesture recognition and responsiveness
- Optimize performance for mobile devices

## Testing Approach

- Test all features in both desktop and mobile browsers
- Verify touch controls work intuitively on mobile devices
- Ensure demo runs smoothly without external dependencies
- Validate GitHub Pages deployment functionality
- Check performance with multiple avatars and objects

## Deployment

The project uses GitHub Pages for hosting with automatic deployment on push to main branch. The demo should work immediately without requiring external CDN resources during development.