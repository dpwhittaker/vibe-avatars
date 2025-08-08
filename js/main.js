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
            // Note: Physics disabled for now - can be enabled with CannonJS or other physics engines

            // Create basic lighting
            const light = new BABYLON.HemisphericLight('light', new BABYLON.Vector3(0, 1, 0), this.scene);
            light.intensity = 0.7;

            // Create ground
            const ground = BABYLON.MeshBuilder.CreateGround('ground', { width: 50, height: 50 }, this.scene);
            const groundMaterial = new BABYLON.StandardMaterial('groundMaterial', this.scene);
            groundMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
            ground.material = groundMaterial;
            // Physics disabled for now

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
            document.getElementById('loading').style.display = 'none';

        } catch (error) {
            console.error('Error initializing app:', error);
            document.getElementById('loading').innerHTML = 'Error loading application';
        }
    }

    setupUI() {
        document.getElementById('spawnAvatar').addEventListener('click', () => {
            this.characterController.spawnAvatar();
        });

        document.getElementById('toggleGizmos').addEventListener('click', () => {
            this.gizmoManager.toggleGizmos();
        });

        document.getElementById('loadAsset').addEventListener('click', () => {
            this.assetLibrarian.loadRandomAsset();
        });
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