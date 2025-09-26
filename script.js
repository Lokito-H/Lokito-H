// 3D Scene Manager
class Scene3DManager {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.currentModel = null;
        this.animationId = null;
        this.isPlaying = true;
        this.rotationSpeed = 1;
        this.models = {};
        this.lights = {};
        this.stats = {
            frameCount: 0,
            lastTime: performance.now(),
            fps: 60
        };
        
        this.init();
        this.setupEventListeners();
        this.loadModels();
    }

    init() {
        // Get canvas element
        const canvas = document.getElementById('canvas3d');
        
        // Create scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x0d1117);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            canvas.offsetWidth / canvas.offsetHeight,
            0.1,
            1000
        );
        this.camera.position.set(5, 5, 5);
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        
        // Create controls
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.autoRotate = true;
        this.controls.autoRotateSpeed = 2;
        
        // Setup lighting
        this.setupLighting();
        
        // Start animation loop
        this.animate();
        
        // Handle window resize
        window.addEventListener('resize', () => this.onWindowResize());
    }

    setupLighting() {
        // Ambient light
        const ambientLight = new THREE.AmbientLight(0x404040, 0.4);
        this.scene.add(ambientLight);
        this.lights.ambient = ambientLight;
        
        // Directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(10, 10, 5);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        this.scene.add(directionalLight);
        this.lights.directional = directionalLight;
        
        // Point lights for dynamic lighting
        const pointLight1 = new THREE.PointLight(0x00ff88, 0.5, 100);
        pointLight1.position.set(10, 10, 10);
        this.scene.add(pointLight1);
        this.lights.point1 = pointLight1;
        
        const pointLight2 = new THREE.PointLight(0xff0066, 0.3, 100);
        pointLight2.position.set(-10, -10, -10);
        this.scene.add(pointLight2);
        this.lights.point2 = pointLight2;
    }

    loadModels() {
        const geometries = {
            cube: new THREE.BoxGeometry(2, 2, 2),
            sphere: new THREE.SphereGeometry(1.5, 32, 32),
            torus: new THREE.TorusGeometry(1.5, 0.5, 16, 100),
            icosahedron: new THREE.IcosahedronGeometry(1.5, 0),
            dodecahedron: new THREE.DodecahedronGeometry(1.5, 0),
            tetrahedron: new THREE.TetrahedronGeometry(2, 0)
        };

        // Create materials with different properties
        Object.keys(geometries).forEach(name => {
            const geometry = geometries[name];
            
            // Standard material
            const material = new THREE.MeshPhongMaterial({
                color: 0x00ff88,
                shininess: 100,
                transparent: true,
                opacity: 0.9
            });
            
            // Wireframe material for wireframe mode
            const wireframeMaterial = new THREE.MeshBasicMaterial({
                color: 0x00ff88,
                wireframe: true,
                transparent: true,
                opacity: 0.8
            });
            
            const mesh = new THREE.Mesh(geometry, material);
            mesh.castShadow = true;
            mesh.receiveShadow = true;
            
            // Store both materials for easy switching
            mesh.userData = {
                standardMaterial: material,
                wireframeMaterial: wireframeMaterial,
                originalColor: 0x00ff88,
                geometry: name,
                vertexCount: geometry.attributes.position.count,
                faceCount: geometry.index ? geometry.index.count / 3 : geometry.attributes.position.count / 3
            };
            
            this.models[name] = mesh;
        });
        
        // Load initial model
        this.switchModel('cube');
        
        // Hide loading screen
        this.hideLoadingScreen();
    }

    switchModel(modelName) {
        if (this.currentModel) {
            this.scene.remove(this.currentModel);
        }
        
        if (this.models[modelName]) {
            this.currentModel = this.models[modelName];
            this.scene.add(this.currentModel);
            this.updateModelInfo();
        }
    }

    updateModelInfo() {
        if (!this.currentModel) return;
        
        const userData = this.currentModel.userData;
        document.getElementById('current-model').textContent = 
            userData.geometry.charAt(0).toUpperCase() + userData.geometry.slice(1);
        document.getElementById('vertex-count').textContent = userData.vertexCount;
        document.getElementById('face-count').textContent = Math.floor(userData.faceCount);
    }

    animate() {
        this.animationId = requestAnimationFrame(() => this.animate());
        
        // Update FPS counter
        this.updateFPS();
        
        if (this.isPlaying && this.currentModel) {
            // Rotate model
            this.currentModel.rotation.x += 0.01 * this.rotationSpeed;
            this.currentModel.rotation.y += 0.01 * this.rotationSpeed;
            
            // Animate lights
            const time = Date.now() * 0.001;
            if (this.lights.point1) {
                this.lights.point1.position.x = Math.sin(time) * 10;
                this.lights.point1.position.z = Math.cos(time) * 10;
            }
            if (this.lights.point2) {
                this.lights.point2.position.x = -Math.sin(time * 0.7) * 8;
                this.lights.point2.position.z = -Math.cos(time * 0.7) * 8;
            }
        }
        
        // Update controls
        this.controls.update();
        
        // Render scene
        this.renderer.render(this.scene, this.camera);
    }

    updateFPS() {
        this.stats.frameCount++;
        const currentTime = performance.now();
        
        if (currentTime >= this.stats.lastTime + 1000) {
            this.stats.fps = Math.round((this.stats.frameCount * 1000) / (currentTime - this.stats.lastTime));
            this.stats.frameCount = 0;
            this.stats.lastTime = currentTime;
            
            document.getElementById('fps-counter').textContent = this.stats.fps;
        }
    }

    togglePlayPause() {
        this.isPlaying = !this.isPlaying;
        const button = document.getElementById('play-pause-btn');
        button.textContent = this.isPlaying ? '⏸️ Pause' : '▶️ Play';
    }

    resetModel() {
        if (!this.currentModel) return;
        
        this.currentModel.rotation.set(0, 0, 0);
        this.currentModel.scale.set(1, 1, 1);
        this.camera.position.set(5, 5, 5);
        this.controls.reset();
        
        // Reset controls to default values
        document.getElementById('rotation-speed').value = 1;
        document.getElementById('scale-slider').value = 1;
        document.getElementById('light-intensity').value = 1;
        document.getElementById('color-picker').value = '#00ff88';
        document.getElementById('wireframe-toggle').checked = false;
        document.getElementById('auto-rotate-toggle').checked = true;
        
        this.updateControlValues();
    }

    setRotationSpeed(speed) {
        this.rotationSpeed = parseFloat(speed);
        document.getElementById('speed-value').textContent = speed + 'x';
    }

    setScale(scale) {
        if (!this.currentModel) return;
        
        const scaleValue = parseFloat(scale);
        this.currentModel.scale.set(scaleValue, scaleValue, scaleValue);
        document.getElementById('scale-value').textContent = scale + 'x';
    }

    setColor(color) {
        if (!this.currentModel) return;
        
        const material = this.currentModel.material;
        material.color.setHex(color.replace('#', '0x'));
        this.currentModel.userData.originalColor = parseInt(color.replace('#', '0x'), 16);
    }

    setRandomColor() {
        const colors = [
            '#00ff88', '#ff0066', '#00d4ff', '#ff6600', '#9d4edd', 
            '#f72585', '#4cc9f0', '#7209b7', '#560bad', '#480ca8'
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        document.getElementById('color-picker').value = randomColor;
        this.setColor(randomColor);
    }

    setLightIntensity(intensity) {
        const intensityValue = parseFloat(intensity);
        
        if (this.lights.directional) {
            this.lights.directional.intensity = intensityValue;
        }
        if (this.lights.point1) {
            this.lights.point1.intensity = intensityValue * 0.5;
        }
        if (this.lights.point2) {
            this.lights.point2.intensity = intensityValue * 0.3;
        }
        
        document.getElementById('light-value').textContent = intensity + 'x';
    }

    toggleWireframe(enabled) {
        if (!this.currentModel) return;
        
        if (enabled) {
            this.currentModel.material = this.currentModel.userData.wireframeMaterial;
        } else {
            this.currentModel.material = this.currentModel.userData.standardMaterial;
        }
    }

    toggleAutoRotate(enabled) {
        this.controls.autoRotate = enabled;
    }

    updateControlValues() {
        // Update display values for sliders
        const rotationSpeed = document.getElementById('rotation-speed').value;
        const scale = document.getElementById('scale-slider').value;
        const lightIntensity = document.getElementById('light-intensity').value;
        
        document.getElementById('speed-value').textContent = rotationSpeed + 'x';
        document.getElementById('scale-value').textContent = scale + 'x';
        document.getElementById('light-value').textContent = lightIntensity + 'x';
    }

    hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        loadingScreen.classList.add('hidden');
        setTimeout(() => {
            loadingScreen.style.display = 'none';
        }, 500);
    }

    onWindowResize() {
        const canvas = document.getElementById('canvas3d');
        const width = canvas.offsetWidth;
        const height = canvas.offsetHeight;
        
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(width, height);
    }

    setupEventListeners() {
        // Model selector
        document.getElementById('model-selector').addEventListener('change', (e) => {
            this.switchModel(e.target.value);
        });
        
        // Animation controls
        document.getElementById('play-pause-btn').addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            this.resetModel();
        });
        
        // Rotation speed
        document.getElementById('rotation-speed').addEventListener('input', (e) => {
            this.setRotationSpeed(e.target.value);
        });
        
        // Scale
        document.getElementById('scale-slider').addEventListener('input', (e) => {
            this.setScale(e.target.value);
        });
        
        // Color controls
        document.getElementById('color-picker').addEventListener('change', (e) => {
            this.setColor(e.target.value);
        });
        
        document.getElementById('random-color-btn').addEventListener('click', () => {
            this.setRandomColor();
        });
        
        // Light intensity
        document.getElementById('light-intensity').addEventListener('input', (e) => {
            this.setLightIntensity(e.target.value);
        });
        
        // Wireframe toggle
        document.getElementById('wireframe-toggle').addEventListener('change', (e) => {
            this.toggleWireframe(e.target.checked);
        });
        
        // Auto-rotate toggle
        document.getElementById('auto-rotate-toggle').addEventListener('change', (e) => {
            this.toggleAutoRotate(e.target.checked);
        });
    }

    // Cleanup method
    dispose() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        // Dispose of geometries and materials
        Object.values(this.models).forEach(model => {
            if (model.geometry) model.geometry.dispose();
            if (model.material) model.material.dispose();
            if (model.userData.wireframeMaterial) model.userData.wireframeMaterial.dispose();
        });
        
        // Dispose of renderer
        if (this.renderer) {
            this.renderer.dispose();
        }
    }
}

// Enhanced UI Manager
class UIManager {
    constructor() {
        this.setupSmoothScrolling();
        this.setupNavigation();
        this.setupAnimations();
    }

    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    setupNavigation() {
        const header = document.querySelector('.header');
        let lastScrollTop = 0;
        
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                // Scrolling down
                header.style.transform = 'translateY(-100%)';
            } else {
                // Scrolling up
                header.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

    setupAnimations() {
        // Intersection Observer for fade-in animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        document.querySelectorAll('.instruction-item, .about-section').forEach(el => {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
            observer.observe(el);
        });
    }

    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.innerHTML = `
            <span>${message}</span>
            <button onclick="this.parentElement.remove()">×</button>
        `;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--background-card);
            border: 1px solid var(--border-color);
            border-radius: var(--border-radius);
            padding: 1rem;
            color: var(--text-primary);
            box-shadow: var(--shadow-card);
            z-index: 10000;
            min-width: 300px;
            display: flex;
            justify-content: space-between;
            align-items: center;
        `;
        
        document.body.appendChild(notification);
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Performance Monitor
class PerformanceMonitor {
    constructor() {
        this.startTime = performance.now();
        this.frameCount = 0;
        this.memoryUsage = 0;
        
        if (performance.memory) {
            this.monitorMemory();
        }
    }

    monitorMemory() {
        setInterval(() => {
            if (performance.memory) {
                this.memoryUsage = Math.round(performance.memory.usedJSHeapSize / 1048576); // MB
            }
        }, 1000);
    }

    getStats() {
        return {
            uptime: Math.round((performance.now() - this.startTime) / 1000),
            memory: this.memoryUsage
        };
    }
}

// Initialize application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Initialize managers
    const scene3D = new Scene3DManager();
    const uiManager = new UIManager();
    const performanceMonitor = new PerformanceMonitor();
    
    // Global access for debugging
    window.scene3D = scene3D;
    window.uiManager = uiManager;
    window.performanceMonitor = performanceMonitor;
    
    // Welcome notification
    setTimeout(() => {
        uiManager.showNotification('🎯 Welcome to Lokito\'s 3D Showcase! Use the controls to interact with the models.', 'info');
    }, 2000);
    
    // Cleanup on page unload
    window.addEventListener('beforeunload', () => {
        scene3D.dispose();
    });
    
    console.log('🎯 3D Showcase initialized successfully!');
    console.log('📊 Performance monitoring enabled');
    console.log('🎮 Use the control panel to interact with 3D models');
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    if (!window.scene3D) return;
    
    switch(e.key.toLowerCase()) {
        case ' ':
            e.preventDefault();
            window.scene3D.togglePlayPause();
            break;
        case 'r':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                window.scene3D.resetModel();
            }
            break;
        case 'c':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                window.scene3D.setRandomColor();
            }
            break;
        case 'w':
            if (e.ctrlKey || e.metaKey) {
                e.preventDefault();
                const wireframeToggle = document.getElementById('wireframe-toggle');
                wireframeToggle.checked = !wireframeToggle.checked;
                window.scene3D.toggleWireframe(wireframeToggle.checked);
            }
            break;
    }
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { Scene3DManager, UIManager, PerformanceMonitor };
}