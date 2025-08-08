export class CharacterController {
    constructor(scene) {
        this.scene = scene;
        this.avatars = [];
        this.selectedAvatar = null;
        this.inputMap = {};
        this.setupInput();
    }

    setupInput() {
        // Set up keyboard input
        this.scene.onKeyboardObservable.add((kbInfo) => {
            switch (kbInfo.type) {
                case BABYLON.KeyboardEventTypes.KEYDOWN:
                    this.inputMap[kbInfo.event.code] = true;
                    break;
                case BABYLON.KeyboardEventTypes.KEYUP:
                    this.inputMap[kbInfo.event.code] = false;
                    break;
            }
        });

        // Register before render loop for movement
        this.scene.registerBeforeRender(() => {
            this.updateMovement();
        });
    }

    spawnAvatar() {
        // Create a simple avatar (capsule for now)
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

        // Physics disabled for now - can be enabled with physics engine
        // avatar.physicsImpostor = new BABYLON.PhysicsImpostor(avatar, 
        //     BABYLON.PhysicsImpostor.CapsuleImpostor, 
        //     { mass: 1, restitution: 0.1 }, this.scene);

        // Add custom properties
        avatar.userData = {
            type: 'avatar',
            speed: 5,
            jumpForce: 10
        };

        // Make it selectable
        avatar.actionManager = new BABYLON.ActionManager(this.scene);
        avatar.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger, 
            () => this.selectAvatar(avatar)
        ));

        this.avatars.push(avatar);
        this.selectAvatar(avatar);

        console.log('Avatar spawned at', avatar.position);
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

        // Apply movement
        if (movement.length() > 0) {
            avatar.position.addInPlace(movement);
        }

        // Jump (simplified without physics)
        if (this.inputMap['Space']) {
            movement.y += speed * deltaTime * 2; // Simple jump movement
        }
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
            avatar.dispose();
        }
    }
}