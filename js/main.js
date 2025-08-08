import { CharacterController } from './character-controller.js';
import { GizmoManager } from './gizmo-manager.js';
import { AssetLibrarian } from './asset-librarian.js';

class VibeAvatarsApp {
    constructor() {
        this.canvas = null;
        this.engine = null;
        this.scene = null;
        this.camera = null;
        this.characterController = null;
        this.gizmoManager = null;
        this.assetLibrarian = null;
    }

    async init() {
        try {
            // Get canvas and create engine
            this.canvas = document.getElementById('renderCanvas');
            this.engine = new BABYLON.Engine(this.canvas, true);
            
            // Create scene
            this.scene = new BABYLON.Scene(this.engine);
            
            // Initialize Havok Physics V2
            const havokInstance = await HavokPhysics();
            const hk = new BABYLON.HavokPlugin(true, havokInstance);
            this.scene.enablePhysics(new BABYLON.Vector3(0, -9.81, 0), hk);

            // Create basic lighting
            const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.scene);
            light.intensity = 0.7;

            // Create ground with physics
            const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, this.scene);
            const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
            groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
            ground.material = groundMaterial;
            ground.physicsImpostor = new BABYLON.PhysicsImpostor(ground, BABYLON.PhysicsImpostor.BoxImpostor, 
                { mass: 0, restitution: 0.7 }, this.scene);

            // Create camera
            this.camera = new BABYLON.ArcRotateCamera('camera', -Math.PI / 2, Math.PI / 2.5, 15, 
                new BABYLON.Vector3(0, 0, 0), this.scene);
            this.camera.attachControls(this.canvas, true);

            // Initialize modules
            this.characterController = new CharacterController(this.scene);
            this.gizmoManager = new GizmoManager(this.scene);
            this.assetLibrarian = new AssetLibrarian(this.scene);

            // Set up UI event handlers
            this.setupUI();

            // Start render loop
            this.engine.runRenderLoop(() => {
                this.scene.render();
            });

            // Handle window resize
            window.addEventListener('resize', () => {
                this.engine.resize();
            });

            console.log('Vibe Avatars app initialized successfully');
            if (document.getElementById('loading')) {
                document.getElementById('loading').style.display = 'none';
            }

        } catch (error) {
            console.error('Error initializing app:', error);
            if (document.getElementById('loading')) {
                document.getElementById('loading').innerHTML = 'Error loading application';
            }
        }
    }

    setupUI() {
        // Desktop UI handlers
        document.getElementById('spawnAvatar').addEventListener('click', () => {
            this.characterController.spawnAvatar();
        });

        document.getElementById('toggleGizmos').addEventListener('click', () => {
            this.gizmoManager.toggleGizmos();
        });

        document.getElementById('loadAsset').addEventListener('click', () => {
            this.assetLibrarian.loadRandomAsset();
        });
        
        // Mobile UI handlers
        document.getElementById('spawnAvatarMobile').addEventListener('click', () => {
            this.characterController.spawnAvatar();
        });

        document.getElementById('toggleGizmosMobile').addEventListener('click', () => {
            this.gizmoManager.toggleGizmos();
        });

        document.getElementById('loadAssetMobile').addEventListener('click', () => {
            this.assetLibrarian.loadRandomAsset();
        });

        document.getElementById('clearSceneMobile').addEventListener('click', () => {
            this.clearScene();
        });
        
        // Virtual controls setup
        this.setupVirtualControls();
    }
    
    setupVirtualControls() {
        const dpadButtons = document.querySelectorAll('.dpad-btn');
        
        dpadButtons.forEach(button => {
            const key = button.getAttribute('data-key');
            
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.characterController.handleKeyDown(key);
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.characterController.handleKeyUp(key);
            });
            
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.characterController.handleKeyDown(key);
            });
            
            button.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.characterController.handleKeyUp(key);
            });
        });
    }
    
    clearScene() {
        // Clear all spawned objects except ground
        this.characterController.clearAvatars();
        this.assetLibrarian.clearAssets();
    }

    dispose() {
        if (this.engine) {
            this.engine.dispose();
        }
    }
}

// Initialize app when page loads
window.addEventListener('DOMContentLoaded', async () => {
    const app = new VibeAvatarsApp();
    await app.init();
});

// Handle page unload
window.addEventListener('beforeunload', () => {
    if (window.app) {
        window.app.dispose();
    }
});