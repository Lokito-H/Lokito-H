// Local Three.js fallback for demonstration
// This is a simplified version for demonstration purposes
// In production, use the full Three.js library from CDN

window.THREE = {
    Scene: function() {
        this.background = null;
        this.children = [];
        this.add = function(obj) { this.children.push(obj); };
        this.remove = function(obj) { 
            const index = this.children.indexOf(obj);
            if (index > -1) this.children.splice(index, 1);
        };
        return this;
    },
    
    PerspectiveCamera: function(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.updateProjectionMatrix = function() {};
        return this;
    },
    
    WebGLRenderer: function(params) {
        this.domElement = params.canvas || document.createElement('canvas');
        this.shadowMap = { enabled: false, type: null };
        this.setSize = function(w, h) { 
            this.domElement.width = w; 
            this.domElement.height = h; 
        };
        this.setPixelRatio = function(ratio) {};
        this.render = function(scene, camera) {
            // Simple canvas rendering for demonstration
            const ctx = this.domElement.getContext('2d');
            if (ctx) {
                const gradient = ctx.createLinearGradient(0, 0, this.domElement.width, this.domElement.height);
                gradient.addColorStop(0, '#0d1117');
                gradient.addColorStop(1, '#161b22');
                ctx.fillStyle = gradient;
                ctx.fillRect(0, 0, this.domElement.width, this.domElement.height);
                
                // Draw a simple rotating shape
                ctx.save();
                ctx.translate(this.domElement.width / 2, this.domElement.height / 2);
                ctx.rotate(Date.now() * 0.001);
                ctx.strokeStyle = '#00ff88';
                ctx.lineWidth = 3;
                
                // Draw a cube outline
                const size = 100;
                ctx.strokeRect(-size/2, -size/2, size, size);
                
                // Draw diagonals
                ctx.beginPath();
                ctx.moveTo(-size/2, -size/2);
                ctx.lineTo(size/2, size/2);
                ctx.moveTo(size/2, -size/2);
                ctx.lineTo(-size/2, size/2);
                ctx.stroke();
                
                ctx.restore();
            }
        };
        this.dispose = function() {};
        return this;
    },
    
    OrbitControls: function(camera, domElement) {
        this.enableDamping = true;
        this.dampingFactor = 0.05;
        this.autoRotate = true;
        this.autoRotateSpeed = 2;
        this.update = function() {};
        this.reset = function() {};
        return this;
    },
    
    // Geometries
    BoxGeometry: function(w, h, d) {
        this.attributes = { position: { count: 8 } };
        this.index = { count: 36 };
        this.dispose = function() {};
        return this;
    },
    
    SphereGeometry: function(radius, widthSegments, heightSegments) {
        this.attributes = { position: { count: widthSegments * heightSegments } };
        this.index = { count: widthSegments * heightSegments * 6 };
        this.dispose = function() {};
        return this;
    },
    
    TorusGeometry: function(radius, tube, radialSegments, tubularSegments) {
        this.attributes = { position: { count: radialSegments * tubularSegments } };
        this.index = { count: radialSegments * tubularSegments * 6 };
        this.dispose = function() {};
        return this;
    },
    
    IcosahedronGeometry: function(radius, detail) {
        this.attributes = { position: { count: 12 } };
        this.index = { count: 60 };
        this.dispose = function() {};
        return this;
    },
    
    DodecahedronGeometry: function(radius, detail) {
        this.attributes = { position: { count: 20 } };
        this.index = { count: 108 };
        this.dispose = function() {};
        return this;
    },
    
    TetrahedronGeometry: function(radius, detail) {
        this.attributes = { position: { count: 4 } };
        this.index = { count: 12 };
        this.dispose = function() {};
        return this;
    },
    
    // Materials
    MeshPhongMaterial: function(params) {
        this.color = { setHex: function(hex) { this.value = hex; }, value: params.color || 0x00ff88 };
        this.shininess = params.shininess || 30;
        this.transparent = params.transparent || false;
        this.opacity = params.opacity || 1;
        this.dispose = function() {};
        return this;
    },
    
    MeshBasicMaterial: function(params) {
        this.color = { setHex: function(hex) { this.value = hex; }, value: params.color || 0x00ff88 };
        this.wireframe = params.wireframe || false;
        this.transparent = params.transparent || false;
        this.opacity = params.opacity || 1;
        this.dispose = function() {};
        return this;
    },
    
    // Mesh
    Mesh: function(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.userData = {};
        this.position = { x: 0, y: 0, z: 0 };
        this.rotation = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.scale = { x: 1, y: 1, z: 1, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.castShadow = false;
        this.receiveShadow = false;
        return this;
    },
    
    // Lights
    AmbientLight: function(color, intensity) {
        this.color = color;
        this.intensity = intensity;
        return this;
    },
    
    DirectionalLight: function(color, intensity) {
        this.color = color;
        this.intensity = intensity;
        this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        this.castShadow = false;
        this.shadow = { mapSize: { width: 1024, height: 1024 } };
        return this;
    },
    
    PointLight: function(color, intensity, distance) {
        this.color = color;
        this.intensity = intensity;
        this.distance = distance;
        this.position = { x: 0, y: 0, z: 0, set: function(x, y, z) { this.x = x; this.y = y; this.z = z; } };
        return this;
    },
    
    // Utilities
    Color: function(color) {
        this.r = 0;
        this.g = 0;
        this.b = 0;
        return this;
    },
    
    PCFSoftShadowMap: 1
};

// Add OrbitControls to THREE namespace
THREE.OrbitControls = THREE.OrbitControls;