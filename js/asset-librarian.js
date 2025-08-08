export class AssetLibrarian {
    constructor(scene) {
        this.scene = scene;
        this.loadedAssets = new Map();
        this.spawnedAssets = [];
        this.assetCategories = {
            furniture: [],
            decorations: [],
            buildings: [],
            characters: []
        };
        
        this.initializePrimitiveAssets();
    }

    initializePrimitiveAssets() {
        // Create some basic primitive assets for demonstration
        this.primitiveAssets = [
            {
                name: 'Chair',
                category: 'furniture',
                createFunction: () => this.createChair()
            },
            {
                name: 'Table',
                category: 'furniture', 
                createFunction: () => this.createTable()
            },
            {
                name: 'House',
                category: 'buildings',
                createFunction: () => this.createHouse()
            },
            {
                name: 'Tree',
                category: 'decorations',
                createFunction: () => this.createTree()
            },
            {
                name: 'Lamp',
                category: 'decorations',
                createFunction: () => this.createLamp()
            }
        ];
    }

    async loadAssetFromLibrary(assetName) {
        try {
            // Try to load from Babylon.js Asset Library via Assets namespace
            const baseUrl = "https://models.babylonjs.com/";
            let assetUrl = "";
            
            // Map asset names to their URLs in the Assets library
            const assetMap = {
                'table': 'Table.glb',
                'chair': 'Chair.glb', 
                'lamp': 'Lamp.glb',
                'tree': 'Tree.glb',
                'house': 'House.glb'
            };
            
            assetUrl = assetMap[assetName.toLowerCase()] || `${assetName}.glb`;
            
            console.log(`Loading asset from Assets library: ${assetName}`);
            
            const result = await BABYLON.SceneLoader.ImportMeshAsync('', baseUrl, assetUrl, this.scene);
            
            if (result.meshes.length > 0) {
                this.loadedAssets.set(assetName, result);
                console.log(`Asset loaded successfully from Assets library: ${assetName}`);
                return result;
            }
            
        } catch (error) {
            console.warn(`Asset not found in library, using primitive: ${assetName}`, error);
        }
        
        return null;
    }

    async loadAsset(assetPath, assetName) {
        try {
            // Check if asset already loaded
            if (this.loadedAssets.has(assetName)) {
                return this.loadedAssets.get(assetName);
            }

            console.log(`Loading asset: ${assetName} from ${assetPath}`);
            
            // Load the asset using Babylon.js asset loader
            const result = await BABYLON.SceneLoader.ImportMeshAsync('', assetPath, assetName, this.scene);
            
            // Store the loaded asset
            this.loadedAssets.set(assetName, result);
            
            console.log(`Asset loaded successfully: ${assetName}`);
            return result;
            
        } catch (error) {
            console.error(`Error loading asset ${assetName}:`, error);
            return null;
        }
    }

    async instantiateAsset(assetName, position = new BABYLON.Vector3(0, 0, 0)) {
        // First try to load from Assets library
        let asset = await this.loadAssetFromLibrary(assetName);
        
        if (asset && asset.meshes.length > 0) {
            // Clone from library asset
            const instance = asset.meshes[0].createInstance(assetName + '_instance_' + Date.now());
            instance.position = position;
            
            // Add physics
            const aggregate = new BABYLON.PhysicsAggregate(instance, BABYLON.PhysicsShapeType.BOX, 
                { mass: 1, restitution: 0.3 }, this.scene);
            instance.userData = { physicsAggregate: aggregate };
            
            this.spawnedAssets.push(instance);
            this.updateUI();
            return instance;
        }
        
        // Try to find in loaded assets
        if (this.loadedAssets.has(assetName)) {
            const originalAsset = this.loadedAssets.get(assetName);
            // Clone the asset
            const instance = originalAsset.meshes[0].clone(assetName + '_instance_' + Date.now());
            instance.position = position;
            
            // Add physics
            const aggregate = new BABYLON.PhysicsAggregate(instance, BABYLON.PhysicsShapeType.BOX, 
                { mass: 1, restitution: 0.3 }, this.scene);
            instance.userData = { physicsAggregate: aggregate };
            
            this.spawnedAssets.push(instance);
            this.updateUI();
            return instance;
        }
        
        // Try to create from primitive assets
        const primitiveAsset = this.primitiveAssets.find(asset => asset.name === assetName);
        if (primitiveAsset) {
            const instance = primitiveAsset.createFunction();
            instance.position = position;
            
            // Add physics to primitive assets
            const aggregate = new BABYLON.PhysicsAggregate(instance, BABYLON.PhysicsShapeType.BOX, 
                { mass: 1, restitution: 0.3 }, this.scene);
            instance.userData = { physicsAggregate: aggregate };
            
            this.spawnedAssets.push(instance);
            this.updateUI();
            return instance;
        }
        
        console.warn(`Asset not found: ${assetName}`);
        return null;
    }

    async loadRandomAsset() {
        // Load a random primitive asset for demonstration
        const randomAsset = this.primitiveAssets[Math.floor(Math.random() * this.primitiveAssets.length)];
        
        const position = new BABYLON.Vector3(
            Math.random() * 10 - 5,
            2, // Start higher to let physics settle
            Math.random() * 10 - 5
        );
        
        const instance = await this.instantiateAsset(randomAsset.name, position);
        if (instance) {
            console.log(`Spawned ${randomAsset.name} at`, position);
        }
        
        return instance;
    }
    
    updateUI() {
        if (document.getElementById('objectCount')) {
            document.getElementById('objectCount').textContent = this.spawnedAssets.length;
        }
    }
    
    clearAssets() {
        this.spawnedAssets.forEach(asset => {
            if (asset.userData && asset.userData.physicsAggregate) {
                asset.userData.physicsAggregate.dispose();
            }
            asset.dispose();
        });
        this.spawnedAssets = [];
        this.updateUI();
    }

    // Primitive asset creation functions
    createChair() {
        const chair = new BABYLON.Mesh('chair', this.scene);
        
        // Chair seat
        const seat = BABYLON.MeshBuilder.CreateBox('seat', { width: 1, height: 0.1, depth: 1 }, this.scene);
        seat.position.y = 0.5;
        seat.parent = chair;
        
        // Chair back
        const back = BABYLON.MeshBuilder.CreateBox('back', { width: 1, height: 1, depth: 0.1 }, this.scene);
        back.position.y = 1;
        back.position.z = -0.45;
        back.parent = chair;
        
        // Chair legs
        for (let i = 0; i < 4; i++) {
            const leg = BABYLON.MeshBuilder.CreateCylinder('leg', { height: 0.5, diameter: 0.1 }, this.scene);
            leg.position.y = 0.25;
            leg.position.x = (i % 2) * 0.8 - 0.4;
            leg.position.z = Math.floor(i / 2) * 0.8 - 0.4;
            leg.parent = chair;
        }
        
        // Material
        const material = new BABYLON.StandardMaterial('chairMaterial', this.scene);
        material.diffuseColor = new BABYLON.Color3(0.6, 0.3, 0.1);
        chair.getChildMeshes().forEach(mesh => mesh.material = material);
        
        return chair;
    }

    createTable() {
        const table = new BABYLON.Mesh('table', this.scene);
        
        // Table top
        const top = BABYLON.MeshBuilder.CreateBox('top', { width: 2, height: 0.1, depth: 1 }, this.scene);
        top.position.y = 0.75;
        top.parent = table;
        
        // Table legs
        for (let i = 0; i < 4; i++) {
            const leg = BABYLON.MeshBuilder.CreateCylinder('leg', { height: 0.75, diameter: 0.1 }, this.scene);
            leg.position.y = 0.375;
            leg.position.x = (i % 2) * 1.6 - 0.8;
            leg.position.z = Math.floor(i / 2) * 0.6 - 0.3;
            leg.parent = table;
        }
        
        // Material
        const material = new BABYLON.StandardMaterial('tableMaterial', this.scene);
        material.diffuseColor = new BABYLON.Color3(0.8, 0.6, 0.3);
        table.getChildMeshes().forEach(mesh => mesh.material = material);
        
        return table;
    }

    createHouse() {
        const house = new BABYLON.Mesh('house', this.scene);
        
        // House base
        const base = BABYLON.MeshBuilder.CreateBox('base', { width: 3, height: 2, depth: 3 }, this.scene);
        base.position.y = 1;
        base.parent = house;
        
        // Roof
        const roof = BABYLON.MeshBuilder.CreateCylinder('roof', { 
            height: 1, 
            diameterTop: 0, 
            diameterBottom: 4 
        }, this.scene);
        roof.position.y = 2.5;
        roof.parent = house;
        
        // Materials
        const baseMaterial = new BABYLON.StandardMaterial('baseMaterial', this.scene);
        baseMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.8, 0.6);
        base.material = baseMaterial;
        
        const roofMaterial = new BABYLON.StandardMaterial('roofMaterial', this.scene);
        roofMaterial.diffuseColor = new BABYLON.Color3(0.6, 0.2, 0.2);
        roof.material = roofMaterial;
        
        return house;
    }

    createTree() {
        const tree = new BABYLON.Mesh('tree', this.scene);
        
        // Trunk
        const trunk = BABYLON.MeshBuilder.CreateCylinder('trunk', { 
            height: 2, 
            diameter: 0.3 
        }, this.scene);
        trunk.position.y = 1;
        trunk.parent = tree;
        
        // Leaves
        const leaves = BABYLON.MeshBuilder.CreateSphere('leaves', { diameter: 2 }, this.scene);
        leaves.position.y = 2.5;
        leaves.parent = tree;
        
        // Materials
        const trunkMaterial = new BABYLON.StandardMaterial('trunkMaterial', this.scene);
        trunkMaterial.diffuseColor = new BABYLON.Color3(0.4, 0.2, 0.1);
        trunk.material = trunkMaterial;
        
        const leavesMaterial = new BABYLON.StandardMaterial('leavesMaterial', this.scene);
        leavesMaterial.diffuseColor = new BABYLON.Color3(0.2, 0.6, 0.2);
        leaves.material = leavesMaterial;
        
        return tree;
    }

    createLamp() {
        const lamp = new BABYLON.Mesh('lamp', this.scene);
        
        // Base
        const base = BABYLON.MeshBuilder.CreateCylinder('base', { 
            height: 0.2, 
            diameter: 0.8 
        }, this.scene);
        base.position.y = 0.1;
        base.parent = lamp;
        
        // Pole
        const pole = BABYLON.MeshBuilder.CreateCylinder('pole', { 
            height: 1.5, 
            diameter: 0.1 
        }, this.scene);
        pole.position.y = 0.85;
        pole.parent = lamp;
        
        // Lampshade
        const shade = BABYLON.MeshBuilder.CreateCylinder('shade', { 
            height: 0.5, 
            diameterTop: 0.8, 
            diameterBottom: 0.4 
        }, this.scene);
        shade.position.y = 1.85;
        shade.parent = lamp;
        
        // Light
        const light = new BABYLON.PointLight('lampLight', new BABYLON.Vector3(0, 1.85, 0), this.scene);
        light.intensity = 0.5;
        light.parent = lamp;
        
        // Materials
        const material = new BABYLON.StandardMaterial('lampMaterial', this.scene);
        material.diffuseColor = new BABYLON.Color3(0.7, 0.7, 0.7);
        lamp.getChildMeshes().forEach(mesh => mesh.material = material);
        
        return lamp;
    }

    getAssetList() {
        return this.primitiveAssets.map(asset => ({
            name: asset.name,
            category: asset.category
        }));
    }

    getAssetsByCategory(category) {
        return this.primitiveAssets.filter(asset => asset.category === category);
    }
}