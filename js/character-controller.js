export class CharacterController {
    constructor(scene) {
        this.scene = scene;
        this.avatars = [];
        this.selectedAvatar = null;
        this.inputMap = {};
        this.keys = {};
        this.setupInput();
    }

    setupInput() {
        // Set up keyboard input
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    this.inputMap[kbInfo.event.code] = true;
                    this.keys[kbInfo.event.key.toLowerCase()] = true;
                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    this.inputMap[kbInfo.event.code] = false;
                    this.keys[kbInfo.event.key.toLowerCase()] = false;
                    break;
            }
        });

        // Register before render loop for movement
        this.scene.registerBeforeRender(() => {
            this.updateMovement();
        });
    }
    
    handleKeyDown(key) {
        this.keys[key] = true;
        if (key === 'w') this.inputMap['KeyW'] = true;
        if (key === 'a') this.inputMap['KeyA'] = true;
        if (key === 's') this.inputMap['KeyS'] = true;
        if (key === 'd') this.inputMap['KeyD'] = true;
        if (key === ' ') this.inputMap['Space'] = true;
    }
    
    handleKeyUp(key) {
        this.keys[key] = false;
        if (key === 'w') this.inputMap['KeyW'] = false;
        if (key === 'a') this.inputMap['KeyA'] = false;
        if (key === 's') this.inputMap['KeyS'] = false;
        if (key === 'd') this.inputMap['KeyD'] = false;
        if (key === ' ') this.inputMap['Space'] = false;
    }

    async spawnAvatar() {
        try {
            // Import HVGirl from Babylon.js asset library
            const result = await BABYLON.SceneLoader.ImportMeshAsync("", "https://models.babylonjs.com/", "HVGirl.glb", this.scene);
            
            if (result.meshes.length === 0) {
                console.warn("HVGirl not found, creating simple avatar");
                return this.createSimpleAvatar();
            }
            
            const avatar = result.meshes[0];
            avatar.name = 'HVGirl_' + this.avatars.length;
            
            // Position avatar at random location
            avatar.position = new BABYLON.Vector3(
                Math.random() * 10 - 5,
                0,
                Math.random() * 10 - 5
            );
            
            // Scale down if needed
            avatar.scaling = new BABYLON.Vector3(1, 1, 1);
            
            // Add physics impostor for character controller
            const avatarAggregate = new BABYLON.PhysicsAggregate(avatar, BABYLON.PhysicsShapeType.CAPSULE, 
                { mass: 1, restitution: 0.1 }, this.scene);
            
            // Add custom properties
            avatar.userData = {
                type: 'avatar',
                speed: 5,
                jumpForce: 10,
                physicsAggregate: avatarAggregate
            };

            // Make it selectable
            avatar.actionManager = new BABYLON.ActionManager(this.scene);
            avatar.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
                BABYLON.ActionManager.OnPickTrigger, 
                () => this.selectAvatar(avatar)
            ));

            this.avatars.push(avatar);
            this.selectAvatar(avatar);
            this.updateUI();

            console.log('HVGirl avatar spawned at', avatar.position);
            return avatar;
            
        } catch (error) {
            console.warn("Error loading HVGirl, creating simple avatar:", error);
            return this.createSimpleAvatar();
        }
    }
    
    createSimpleAvatar() {
        // Fallback simple avatar
        const avatar = BABYLON.MeshBuilder.CreateCapsule('avatar', {
            radius: 0.5,
            height: 2
        }, this.scene);

        // Position avatar at random location
        avatar.position = new BABYLON.Vector3(
            Math.random() * 10 - 5,
            1,
            Math.random() * 10 - 5
        );

        // Create material
        const material = new BABYLON.StandardMaterial('avatarMaterial', this.scene);
        material.diffuseColor = new BABYLON.Color3(
            Math.random(),
            Math.random(),
            Math.random()
        );
        avatar.material = material;

        // Add physics impostor
        const avatarAggregate = new BABYLON.PhysicsAggregate(avatar, BABYLON.PhysicsShapeType.CAPSULE, 
            { mass: 1, restitution: 0.1 }, this.scene);

        // Add custom properties
        avatar.userData = {
            type: 'avatar',
            speed: 5,
            jumpForce: 10,
            physicsAggregate: avatarAggregate
        };

        // Make it selectable
        avatar.actionManager = new BABYLON.ActionManager(this.scene);
        avatar.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger, 
            () => this.selectAvatar(avatar)
        ));

        this.avatars.push(avatar);
        this.selectAvatar(avatar);
        this.updateUI();

        console.log('Simple avatar spawned at', avatar.position);
        return avatar;
    }

    selectAvatar(avatar) {
        // Deselect previous avatar
        if (this.selectedAvatar && this.selectedAvatar.userData.outline) {
            this.selectedAvatar.userData.outline.dispose();
        }

        this.selectedAvatar = avatar;

        // Add selection outline
        const outline = BABYLON.MeshBuilder.CreateCapsule('outline', {
            radius: 0.6,
            height: 2.2
        }, this.scene);
        
        const outlineMaterial = new BABYLON.StandardMaterial('outlineMaterial', this.scene);
        outlineMaterial.diffuseColor = new BABYLON.Color3(1, 1, 0);
        outlineMaterial.alpha = 0.3;
        outlineMaterial.wireframe = true;
        outline.material = outlineMaterial;
        
        outline.position = avatar.position.clone();
        outline.parent = avatar;
        
        avatar.userData.outline = outline;
        
        this.updateUI();
        console.log('Avatar selected');
    }

    updateMovement() {
        if (!this.selectedAvatar) return;

        const avatar = this.selectedAvatar;
        const speed = avatar.userData.speed;
        const deltaTime = this.scene.getEngine().getDeltaTime() / 1000;

        let movement = new BABYLON.Vector3(0, 0, 0);

        // WASD movement
        if (this.inputMap['KeyW']) {
            movement.z += speed * deltaTime;
        }
        if (this.inputMap['KeyS']) {
            movement.z -= speed * deltaTime;
        }
        if (this.inputMap['KeyA']) {
            movement.x -= speed * deltaTime;
        }
        if (this.inputMap['KeyD']) {
            movement.x += speed * deltaTime;
        }

        // Apply movement using physics
        if (movement.length() > 0 && avatar.userData.physicsAggregate) {
            const body = avatar.userData.physicsAggregate.body;
            const velocity = body.getLinearVelocity();
            velocity.x = movement.x * 5; // Scale for physics
            velocity.z = movement.z * 5;
            body.setLinearVelocity(velocity);
        }

        // Jump
        if (this.inputMap['Space'] && avatar.userData.physicsAggregate) {
            const body = avatar.userData.physicsAggregate.body;
            const velocity = body.getLinearVelocity();
            if (Math.abs(velocity.y) < 0.1) { // Only jump if not already jumping
                velocity.y = avatar.userData.jumpForce;
                body.setLinearVelocity(velocity);
            }
        }
    }
    
    updateUI() {
        if (document.getElementById('avatarCount')) {
            document.getElementById('avatarCount').textContent = this.avatars.length;
        }
        if (document.getElementById('selectedInfo')) {
            document.getElementById('selectedInfo').textContent = this.selectedAvatar ? 'Avatar' : 'None';
        }
    }

    clearAvatars() {
        this.avatars.forEach(avatar => {
            if (avatar.userData && avatar.userData.outline) {
                avatar.userData.outline.dispose();
            }
            if (avatar.userData && avatar.userData.physicsAggregate) {
                avatar.userData.physicsAggregate.dispose();
            }
            avatar.dispose();
        });
        this.avatars = [];
        this.selectedAvatar = null;
        this.updateUI();
    }

    getSelectedAvatar() {
        return this.selectedAvatar;
    }

    getAllAvatars() {
        return this.avatars;
    }

    removeAvatar(avatar) {
        const index = this.avatars.indexOf(avatar);
        if (index > -1) {
            this.avatars.splice(index, 1);
            if (this.selectedAvatar === avatar) {
                this.selectedAvatar = null;
            }
            if (avatar.userData && avatar.userData.outline) {
                avatar.userData.outline.dispose();
            }
            if (avatar.userData && avatar.userData.physicsAggregate) {
                avatar.userData.physicsAggregate.dispose();
            }
            avatar.dispose();
            this.updateUI();
        }
    }
}