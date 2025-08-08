class VibeAvatarsDemo {
    constructor() {
        this.scene = document.getElementById('scene');
        this.selectedObject = null;
        this.gizmosEnabled = false;
        this.objects = [];
        this.avatars = [];
        this.selectedAvatar = null;
        this.isDragging = false;
        this.dragOffset = { x: 0, y: 0 };
        this.touchMovementActive = false;
        this.keys = {}; // For virtual controls
        
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupKeyboardControls();
        this.updateUI();
        
        // Create initial ground objects
        this.createInitialScene();
        
        console.log('Vibe Avatars Demo initialized!');
    }

    createInitialScene() {
        // Add a welcome house
        this.createHouse(400, 300);
        this.createTree(200, 350);
        this.createTree(600, 320);
    }

    setupEventListeners() {
        // UI button handlers
        document.getElementById('spawnAvatar').addEventListener('click', () => this.spawnAvatar());
        document.getElementById('toggleGizmos').addEventListener('click', () => this.toggleGizmos());
        document.getElementById('loadAsset').addEventListener('click', () => this.loadRandomAsset());
        document.getElementById('clearScene').addEventListener('click', () => this.clearScene());

        // Mouse events for object interaction
        this.scene.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.scene.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.scene.addEventListener('mouseup', (e) => this.onMouseUp(e));
        
        // Touch events for mobile support
        this.scene.addEventListener('touchstart', (e) => this.onTouchStart(e));
        this.scene.addEventListener('touchmove', (e) => this.onTouchMove(e));
        this.scene.addEventListener('touchend', (e) => this.onTouchEnd(e));
        
        // Virtual controls
        this.setupVirtualControls();
        
        // Prevent context menu and default touch behaviors
        this.scene.addEventListener('contextmenu', (e) => e.preventDefault());
        this.scene.addEventListener('touchstart', (e) => e.preventDefault(), { passive: false });
        this.scene.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    }

    setupKeyboardControls() {
        const keys = {};
        
        document.addEventListener('keydown', (e) => {
            keys[e.key.toLowerCase()] = true;
            this.handleKeyPress(e.key.toLowerCase());
        });
        
        document.addEventListener('keyup', (e) => {
            keys[e.key.toLowerCase()] = false;
        });

        // Store keys reference for virtual controls
        this.keys = keys;

        // Movement loop
        setInterval(() => {
            if (this.selectedAvatar) {
                this.updateAvatarMovement(keys);
            }
        }, 16); // ~60fps
    }

    setupVirtualControls() {
        const dpadButtons = document.querySelectorAll('.dpad-btn');
        
        dpadButtons.forEach(button => {
            const key = button.getAttribute('data-key');
            
            // Handle touch events for virtual buttons
            button.addEventListener('touchstart', (e) => {
                e.preventDefault();
                this.keys[key] = true;
                this.handleKeyPress(key);
                button.style.background = button.classList.contains('dpad-center') 
                    ? 'rgba(255, 107, 107, 1)' 
                    : 'rgba(78, 205, 196, 1)';
            });
            
            button.addEventListener('touchend', (e) => {
                e.preventDefault();
                this.keys[key] = false;
                button.style.background = button.classList.contains('dpad-center') 
                    ? 'rgba(255, 107, 107, 0.8)' 
                    : 'rgba(78, 205, 196, 0.8)';
            });
            
            // Also handle mouse events for testing on desktop
            button.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.keys[key] = true;
                this.handleKeyPress(key);
            });
            
            button.addEventListener('mouseup', (e) => {
                e.preventDefault();
                this.keys[key] = false;
            });
        });
    }

    handleKeyPress(key) {
        if (key === ' ' && this.selectedAvatar) {
            // Jump animation
            this.animateJump(this.selectedAvatar);
        }
    }

    updateAvatarMovement(keys) {
        if (!this.selectedAvatar) return;

        const speed = 2;
        const rect = this.selectedAvatar.getBoundingClientRect();
        const sceneRect = this.scene.getBoundingClientRect();
        
        let newX = this.selectedAvatar.offsetLeft;
        let newY = this.selectedAvatar.offsetTop;

        if (keys['w'] || keys['arrowup']) newY -= speed;
        if (keys['s'] || keys['arrowdown']) newY += speed;
        if (keys['a'] || keys['arrowleft']) newX -= speed;
        if (keys['d'] || keys['arrowright']) newX += speed;

        // Keep avatar in bounds
        newX = Math.max(0, Math.min(newX, this.scene.offsetWidth - this.selectedAvatar.offsetWidth));
        newY = Math.max(0, Math.min(newY, this.scene.offsetHeight - this.selectedAvatar.offsetHeight - 50));

        this.selectedAvatar.style.left = newX + 'px';
        this.selectedAvatar.style.top = newY + 'px';
    }

    animateJump(avatar) {
        avatar.style.transition = 'transform 0.3s ease';
        avatar.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            avatar.style.transform = 'translateY(0)';
        }, 300);
    }

    onMouseDown(e) {
        const target = e.target;
        
        if (target.classList.contains('object-3d')) {
            this.selectObject(target);
            
            if (this.gizmosEnabled) {
                this.startDragging(e, target);
            }
        } else if (target === this.scene) {
            this.selectObject(null);
        }
    }

    onMouseMove(e) {
        if (this.isDragging && this.selectedObject) {
            const newX = e.clientX - this.dragOffset.x;
            const newY = e.clientY - this.dragOffset.y;
            
            // Keep object in bounds
            const maxX = this.scene.offsetWidth - this.selectedObject.offsetWidth;
            const maxY = this.scene.offsetHeight - this.selectedObject.offsetHeight - 50;
            
            this.selectedObject.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
            this.selectedObject.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
        }
    }

    onMouseUp(e) {
        this.isDragging = false;
    }

    // Touch event handlers for mobile support
    onTouchStart(e) {
        if (e.touches.length === 1) {
            const touch = e.touches[0];
            const target = document.elementFromPoint(touch.clientX, touch.clientY);
            
            if (target && target.classList.contains('object-3d')) {
                this.selectObject(target);
                
                if (this.gizmosEnabled) {
                    this.startTouchDragging(touch, target);
                }
            } else if (target === this.scene || target.classList.contains('ground')) {
                this.selectObject(null);
            }
        } else if (e.touches.length === 2) {
            // Two-finger touch for avatar movement
            this.setupTouchMovement(e.touches);
        }
    }

    onTouchMove(e) {
        if (e.touches.length === 1 && this.isDragging && this.selectedObject) {
            const touch = e.touches[0];
            const newX = touch.clientX - this.dragOffset.x;
            const newY = touch.clientY - this.dragOffset.y;
            
            // Keep object in bounds
            const maxX = this.scene.offsetWidth - this.selectedObject.offsetWidth;
            const maxY = this.scene.offsetHeight - this.selectedObject.offsetHeight - 50;
            
            this.selectedObject.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
            this.selectedObject.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
        } else if (e.touches.length === 1 && this.selectedAvatar && !this.isDragging) {
            // Single finger drag to move selected avatar
            this.moveAvatarToTouch(e.touches[0]);
        }
    }

    onTouchEnd(e) {
        this.isDragging = false;
        this.touchMovementActive = false;
    }

    startTouchDragging(touch, object) {
        this.isDragging = true;
        const rect = object.getBoundingClientRect();
        this.dragOffset.x = touch.clientX - rect.left;
        this.dragOffset.y = touch.clientY - rect.top;
    }

    setupTouchMovement(touches) {
        // Use two-finger gestures for special actions
        this.touchMovementActive = true;
        if (this.selectedAvatar) {
            // Jump animation on two-finger tap
            this.animateJump(this.selectedAvatar);
        }
    }

    moveAvatarToTouch(touch) {
        if (!this.selectedAvatar) return;

        const sceneRect = this.scene.getBoundingClientRect();
        const targetX = touch.clientX - sceneRect.left - this.selectedAvatar.offsetWidth / 2;
        const targetY = touch.clientY - sceneRect.top - this.selectedAvatar.offsetHeight / 2;

        // Smooth movement towards touch point
        const currentX = this.selectedAvatar.offsetLeft;
        const currentY = this.selectedAvatar.offsetTop;
        
        const deltaX = targetX - currentX;
        const deltaY = targetY - currentY;
        const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
        
        if (distance > 5) { // Minimum movement threshold
            const speed = Math.min(3, distance / 10); // Adaptive speed
            const newX = currentX + (deltaX / distance) * speed;
            const newY = currentY + (deltaY / distance) * speed;
            
            // Keep avatar in bounds
            const maxX = this.scene.offsetWidth - this.selectedAvatar.offsetWidth;
            const maxY = this.scene.offsetHeight - this.selectedAvatar.offsetHeight - 50;
            
            this.selectedAvatar.style.left = Math.max(0, Math.min(newX, maxX)) + 'px';
            this.selectedAvatar.style.top = Math.max(0, Math.min(newY, maxY)) + 'px';
        }
    }

    startDragging(e, object) {
        this.isDragging = true;
        const rect = object.getBoundingClientRect();
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
    }

    selectObject(object) {
        // Clear previous selection
        if (this.selectedObject) {
            this.selectedObject.classList.remove('selected');
        }
        
        if (this.selectedAvatar) {
            this.selectedAvatar.classList.remove('selected');
            this.selectedAvatar = null;
        }

        this.selectedObject = object;

        if (object) {
            object.classList.add('selected');
            
            if (object.classList.contains('avatar')) {
                this.selectedAvatar = object;
            }
            
            this.updateSelectedInfo(object);
        } else {
            this.updateSelectedInfo(null);
        }
    }

    spawnAvatar() {
        const avatar = document.createElement('div');
        avatar.className = 'object-3d avatar';
        
        // Random position
        const x = Math.random() * (this.scene.offsetWidth - 30);
        const y = Math.random() * (this.scene.offsetHeight - 110) + 50;
        
        avatar.style.left = x + 'px';
        avatar.style.top = y + 'px';
        avatar.style.bottom = '50px';
        
        // Random color
        const hue = Math.random() * 360;
        avatar.style.background = `linear-gradient(45deg, hsl(${hue}, 70%, 60%), hsl(${hue + 60}, 70%, 60%))`;
        
        this.scene.appendChild(avatar);
        this.objects.push(avatar);
        this.avatars.push(avatar);
        
        this.selectObject(avatar);
        this.updateUI();
        
        console.log('Avatar spawned at', x, y);
    }

    toggleGizmos() {
        this.gizmosEnabled = !this.gizmosEnabled;
        const button = document.getElementById('toggleGizmos');
        button.textContent = this.gizmosEnabled ? '🔧 Disable Gizmos' : '🔧 Enable Gizmos';
        console.log('Gizmos', this.gizmosEnabled ? 'enabled' : 'disabled');
    }

    loadRandomAsset() {
        const assets = [
            () => this.createChair(),
            () => this.createTable(),
            () => this.createTree(),
            () => this.createHouse()
        ];
        
        const randomAsset = assets[Math.floor(Math.random() * assets.length)];
        randomAsset();
        this.updateUI();
    }

    createChair(x, y) {
        const chair = document.createElement('div');
        chair.className = 'object-3d furniture chair';
        
        x = x || Math.random() * (this.scene.offsetWidth - 40);
        y = y || Math.random() * (this.scene.offsetHeight - 90) + 50;
        
        chair.style.left = x + 'px';
        chair.style.top = y + 'px';
        chair.style.bottom = '50px';
        
        this.scene.appendChild(chair);
        this.objects.push(chair);
        
        console.log('Chair created at', x, y);
        return chair;
    }

    createTable(x, y) {
        const table = document.createElement('div');
        table.className = 'object-3d furniture table';
        
        x = x || Math.random() * (this.scene.offsetWidth - 60);
        y = y || Math.random() * (this.scene.offsetHeight - 80) + 50;
        
        table.style.left = x + 'px';
        table.style.top = y + 'px';
        table.style.bottom = '50px';
        
        this.scene.appendChild(table);
        this.objects.push(table);
        
        console.log('Table created at', x, y);
        return table;
    }

    createTree(x, y) {
        const tree = document.createElement('div');
        tree.className = 'object-3d tree';
        
        x = x || Math.random() * (this.scene.offsetWidth - 30);
        y = y || Math.random() * (this.scene.offsetHeight - 130) + 50;
        
        tree.style.left = x + 'px';
        tree.style.top = y + 'px';
        tree.style.bottom = '50px';
        
        this.scene.appendChild(tree);
        this.objects.push(tree);
        
        console.log('Tree created at', x, y);
        return tree;
    }

    createHouse(x, y) {
        const house = document.createElement('div');
        house.className = 'object-3d house';
        
        x = x || Math.random() * (this.scene.offsetWidth - 80);
        y = y || Math.random() * (this.scene.offsetHeight - 110) + 50;
        
        house.style.left = x + 'px';
        house.style.top = y + 'px';
        house.style.bottom = '50px';
        
        this.scene.appendChild(house);
        this.objects.push(house);
        
        console.log('House created at', x, y);
        return house;
    }

    clearScene() {
        // Remove all objects except ground
        this.objects.forEach(obj => {
            if (obj.parentNode) {
                obj.parentNode.removeChild(obj);
            }
        });
        
        this.objects = [];
        this.avatars = [];
        this.selectedObject = null;
        this.selectedAvatar = null;
        
        this.updateUI();
        console.log('Scene cleared');
    }

    updateSelectedInfo(object) {
        const info = document.getElementById('selectedInfo');
        if (!object) {
            info.textContent = 'None';
        } else if (object.classList.contains('avatar')) {
            info.textContent = 'Avatar';
        } else if (object.classList.contains('chair')) {
            info.textContent = 'Chair';
        } else if (object.classList.contains('table')) {
            info.textContent = 'Table';
        } else if (object.classList.contains('tree')) {
            info.textContent = 'Tree';
        } else if (object.classList.contains('house')) {
            info.textContent = 'House';
        } else {
            info.textContent = 'Object';
        }
    }

    updateUI() {
        document.getElementById('avatarCount').textContent = this.avatars.length;
        document.getElementById('objectCount').textContent = this.objects.length;
    }
}

// Initialize the demo when page loads
document.addEventListener('DOMContentLoaded', () => {
    window.vibeAvatarsDemo = new VibeAvatarsDemo();
});