export class GizmoManager {
    constructor(scene) {
        this.scene = scene;
        this.gizmoManager = new BABYLON.GizmoManager(scene);
        this.selectedMesh = null;
        this.gizmosEnabled = false;
        
        this.setupGizmos();
        this.setupMeshSelection();
    }

    setupGizmos() {
        // Configure gizmo manager
        this.gizmoManager.positionGizmoEnabled = true;
        this.gizmoManager.rotationGizmoEnabled = true;
        this.gizmoManager.scaleGizmoEnabled = true;
        
        // Initially disable gizmos
        this.gizmoManager.attachToMesh(null);
        
        // Configure gizmo appearance
        if (this.gizmoManager.gizmos.positionGizmo) {
            this.gizmoManager.gizmos.positionGizmo.scaleRatio = 2;
        }
        if (this.gizmoManager.gizmos.rotationGizmo) {
            this.gizmoManager.gizmos.rotationGizmo.scaleRatio = 1.5;
        }
        if (this.gizmoManager.gizmos.scaleGizmo) {
            this.gizmoManager.gizmos.scaleGizmo.scaleRatio = 1.5;
        }
    }

    setupMeshSelection() {
        // Handle mesh picking
        this.scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.pickInfo.hit && pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOWN) {
                const pickedMesh = pointerInfo.pickInfo.pickedMesh;
                
                // Only select meshes that aren't gizmos or UI elements
                if (pickedMesh && 
                    !pickedMesh.name.includes('gizmo') && 
                    !pickedMesh.name.includes('outline') &&
                    pickedMesh.name !== 'ground') {
                    this.selectMesh(pickedMesh);
                }
            }
        });
    }

    selectMesh(mesh) {
        // Clear previous selection outline
        this.clearSelection();
        
        this.selectedMesh = mesh;
        
        // Attach gizmos if enabled
        if (this.gizmosEnabled) {
            this.gizmoManager.attachToMesh(mesh);
        }
        
        // Add selection indicator
        this.addSelectionOutline(mesh);
        
        console.log('Selected mesh:', mesh.name);
    }

    addSelectionOutline(mesh) {
        // Create a simple outline effect
        try {
            if (mesh.userData && mesh.userData.selectionBox) {
                mesh.userData.selectionBox.dispose();
            }
            
            // Create bounding box outline
            const boundingInfo = mesh.getBoundingInfo();
            const size = boundingInfo.maximum.subtract(boundingInfo.minimum);
            
            const selectionBox = BABYLON.MeshBuilder.CreateBox('selectionBox', {
                width: size.x * 1.1,
                height: size.y * 1.1,
                depth: size.z * 1.1
            }, this.scene);
            
            const selectionMaterial = new BABYLON.StandardMaterial('selectionMaterial', this.scene);
            selectionMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
            selectionMaterial.alpha = 0.2;
            selectionMaterial.wireframe = true;
            selectionBox.material = selectionMaterial;
            
            // Position the selection box
            selectionBox.position = mesh.position.clone();
            selectionBox.rotation = mesh.rotation.clone();
            
            // Store reference
            if (!mesh.userData) {
                mesh.userData = {};
            }
            mesh.userData.selectionBox = selectionBox;
            
        } catch (error) {
            console.warn('Could not create selection outline:', error);
        }
    }

    clearSelection() {
        if (this.selectedMesh && this.selectedMesh.userData && this.selectedMesh.userData.selectionBox) {
            this.selectedMesh.userData.selectionBox.dispose();
            this.selectedMesh.userData.selectionBox = null;
        }
        this.selectedMesh = null;
        this.gizmoManager.attachToMesh(null);
    }

    toggleGizmos() {
        this.gizmosEnabled = !this.gizmosEnabled;
        
        if (this.gizmosEnabled && this.selectedMesh) {
            this.gizmoManager.attachToMesh(this.selectedMesh);
            console.log('Gizmos enabled');
        } else {
            this.gizmoManager.attachToMesh(null);
            console.log('Gizmos disabled');
        }
        
        // Update button text
        const button = document.getElementById('toggleGizmos');
        if (button) {
            button.textContent = this.gizmosEnabled ? 'Disable Gizmos' : 'Enable Gizmos';
        }
    }

    setGizmoMode(mode) {
        // Mode can be 'position', 'rotation', 'scale', or 'all'
        this.gizmoManager.positionGizmoEnabled = mode === 'position' || mode === 'all';
        this.gizmoManager.rotationGizmoEnabled = mode === 'rotation' || mode === 'all';
        this.gizmoManager.scaleGizmoEnabled = mode === 'scale' || mode === 'all';
        
        console.log('Gizmo mode set to:', mode);
    }

    getSelectedMesh() {
        return this.selectedMesh;
    }

    isGizmosEnabled() {
        return this.gizmosEnabled;
    }

    dispose() {
        this.clearSelection();
        if (this.gizmoManager) {
            this.gizmoManager.dispose();
        }
    }
}