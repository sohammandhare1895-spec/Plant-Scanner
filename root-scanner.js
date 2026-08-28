// root-scanner.js - Root scanner page logic

(function() {
    'use strict';

    let canvas = document.getElementById('rootCanvas');
    let ctx = canvas ? canvas.getContext('2d') : null;

    function init() {
        setupControls();
        drawRootVisualization();
        updateSoilMetrics();
    }

    function setupControls() {
        const scanBtn = document.getElementById('scanRootBtn');
        const uploadBtn = document.getElementById('uploadRootBtn');
        const depthSelect = document.getElementById('rootDepthSelect');

        if (scanBtn) {
            scanBtn.addEventListener('click', performRootScan);
        }

        if (uploadBtn) {
            uploadBtn.addEventListener('click', () => {
                const input = document.createElement('input');
                input.type = 'file';
                input.accept = 'image/*';
                input.onchange = handleUpload;
                input.click();
            });
        }

        if (depthSelect) {
            depthSelect.addEventListener('change', function() {
                drawRootVisualization(this.value);
            });
        }
    }

    function performRootScan() {
        const results = document.getElementById('rootAnalysisResults');
        if (!results) return;

        // Show scanning animation
        results.innerHTML = '<div class="scanning-animation"><i class="fas fa-spinner fa-spin"></i> Scanning root system...</div>';

        // Simulate scan
        setTimeout(() => {
            const depth = document.getElementById('rootDepthSelect')?.value || 'medium';
            const rootData = window.RootAnalyzer ? window.RootAnalyzer.analyze() : {
                depth: 25,
                health: 'Good',
                density: 75,
                moisture: 55,
                status: 'Good'
            };

            displayResults(rootData);
            drawRootVisualization(depth, rootData);
            updateSoilMetrics(rootData);
        }, 2500);
    }

    function handleUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = function(e) {
            const img = new Image();
            img.onload = function() {
                // Draw uploaded image on canvas
                if (ctx && canvas) {
                    canvas.width = 400;
                    canvas.height = 300;
                    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                    
                    // Simulate analysis
                    const results = document.getElementById('rootAnalysisResults');
                    if (results) {
                        results.innerHTML = '<div class="scanning-animation"><i class="fas fa-spinner fa-spin"></i> Analyzing uploaded image...</div>';
                        setTimeout(() => {
                            const rootData = window.RootAnalyzer ? 
                                window.RootAnalyzer.analyze() : 
                                { depth: 30, health: 'Good', density: 70, moisture: 60 };
                            displayResults(rootData);
                            updateSoilMetrics(rootData);
                        }, 2000);
                    }
                }
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    function displayResults(data) {
        const container = document.getElementById('rootAnalysisResults');
        if (!container) return;

        const statusColors = {
            'Excellent': '#4caf50',
            'Good': '#8bc34a',
            'Moderate': '#ff9800',
            'Poor': '#f44336'
        };

        container.innerHTML = `
            <div class="root-result-grid">
                <div class="result-item">
                    <span class="result-label">Root Depth</span>
                    <span class="result-value">${Math.round(data.depth || 25)} cm</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Health Status</span>
                    <span class="result-value" style="color:${statusColors[data.health] || '#4caf50'}">${data.health || 'Good'}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Density</span>
                    <span class="result-value">${Math.round(data.density || 70)}%</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Moisture</span>
                    <span class="result-value">${Math.round(data.moisture || 55)}%</span>
                </div>
                <div class="result-item full-width">
                    <span class="result-label">Recommendations</span>
                    <ul class="result-recommendations">
                        ${(data.recommendations || ['Maintain current care']).map(r => `<li>${r}</li>`).join('')}
                    </ul>
                </div>
            </div>
        `;
    }

    function drawRootVisualization(depth = 'medium', data = null) {
        if (!ctx || !canvas) return;

        const w = canvas.width;
        const h = canvas.height;
        ctx.clearRect(0, 0, w, h);

        // Soil layers
        const depthMap = {
            'shallow': { layers: 2, maxDepth: 0.3 },
            'medium': { layers: 3, maxDepth: 0.6 },
            'deep': { layers: 5, maxDepth: 0.9 }
        };

        const config = depthMap[depth] || depthMap['medium'];

        // Draw soil layers
        for (let i = 0; i < config.layers; i++) {
            const y = h - (i + 1) * (h / config.layers);
            const height = h / config.layers;
            const lightness = 40 + i * 8;
            ctx.fillStyle = `hsl(30, 30%, ${lightness}%)`;
            ctx.fillRect(0, y, w, height);
            
            // Add texture lines
            ctx.strokeStyle = `hsla(30, 20%, ${lightness + 10}%, 0.3)`;
            ctx.lineWidth = 1;
            for (let j = 0; j < 10; j++) {
                const x = Math.random() * w;
                const startY = y + Math.random() * height;
                ctx.beginPath();
                ctx.moveTo(x, startY);
                ctx.lineTo(x + 20 + Math.random() * 40, startY + 5 + Math.random() * 10);
                ctx.stroke();
            }
        }

        // Draw roots
        const health = data?.health || 'Good';
        const healthScore = {
            'Excellent': 0.9,
            'Good': 0.7,
            'Moderate': 0.5,
            'Poor': 0.3
        };

        const score = healthScore[health] || 0.7;
        const rootCount = Math.floor(25 + score * 35);

        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;

        for (let i = 0; i < rootCount; i++) {
            const x = 20 + Math.random() * (w - 40);
            const y = h - 20 - Math.random() * 30;
            const length = 20 + Math.random() * 70 * score;
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.6;

            // Main root
            ctx.beginPath();
            ctx.moveTo(x, y);
            
            // Root thickness varies
            const thickness = 1 + Math.random() * 2;
            ctx.lineWidth = thickness;

            let cx = x;
            let cy = y;
            for (let step = 0; step < length; step += 5) {
                const progress = step / length;
                const variation = Math.sin(step * 0.5 + i) * 3 * (1 - progress * 0.5);
                cx = x + Math.cos(angle) * step + variation;
                cy = y + Math.sin(angle) * step + Math.cos(step * 0.3) * 2 * progress;
                ctx.lineTo(cx, cy);
            }
            ctx.stroke();

            // Branches
            if (Math.random() > 0.5) {
                const branchPoint = 0.4 + Math.random() * 0.4;
                const bx = x + Math.cos(angle) * length * branchPoint;
                const by = y + Math.sin(angle) * length * branchPoint;
                const bAngle = angle + (Math.random() - 0.5) * 1.5;
                const bLength = length * 0.3 * score;

                ctx.beginPath();
                ctx.moveTo(bx, by);
                ctx.lineWidth = thickness * 0.7;
                for (let step = 0; step < bLength; step += 5) {
                    const progress = step / bLength;
                    const bv = Math.sin(step * 0.7 + i * 2) * 2 * (1 - progress * 0.3);
                    const px = bx + Math.cos(bAngle) * step + bv;
                    const py = by + Math.sin(bAngle) * step + Math.cos(step * 0.4) * 1.5 * progress;
                    ctx.lineTo(px, py);
                }
                ctx.stroke();
            }
        }

        // Add root tips (small dots)
        ctx.fillStyle = '#a1887f';
        for (let i = 0; i < rootCount * 0.3; i++) {
            const x = 30 + Math.random() * (w - 60);
            const y = h - 40 - Math.random() * 100 * score;
            ctx.beginPath();
            ctx.arc(x, y, 1 + Math.random() * 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Add top soil layer
        const grad = ctx.createLinearGradient(0, 0, 0, 20);
        grad.addColorStop(0, 'rgba(139, 90, 43, 0.2)');
        grad.addColorStop(1, 'rgba(139, 90, 43, 0)');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, 20);

        // Draw grass on top
        ctx.strokeStyle = '#4caf50';
        ctx.lineWidth = 1;
        for (let i = 0; i < 40; i++) {
            const x = Math.random() * w;
            const height = 5 + Math.random() * 12;
            ctx.beginPath();
            ctx.moveTo(x, 2);
            ctx.quadraticCurveTo(x + (Math.random() - 0.5) * 8, -height, x + (Math.random() - 0.5) * 10, 0);
            ctx.stroke();
        }
    }

    function updateSoilMetrics(data = null) {
        // Simulate or use data
        const moisture = data?.moisture || 45 + Math.random() * 30;
        const ph = 5.5 + Math.random() * 2;
        const compaction = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];
        const organic = ['Low', 'Medium', 'High'][Math.floor(Math.random() * 3)];

        const moistureEl = document.getElementById('soilMoisture');
        const moistureVal = document.getElementById('moistureValue');
        const phEl = document.getElementById('soilPH');
        const phVal = document.getElementById('phValue');
        const compactionEl = document.getElementById('soilCompaction');
        const compactionVal = document.getElementById('compactionValue');
        const organicEl = document.getElementById('soilOrganic');
        const organicVal = document.getElementById('organicValue');

        if (moistureEl) moistureEl.style.width = Math.min(100, moisture) + '%';
        if (moistureVal) moistureVal.textContent = Math.round(moisture) + '%';
        if (phEl) phEl.style.width = ((ph - 4) / 5 * 100) + '%';
        if (phVal) phVal.textContent = ph.toFixed(1);
        if (compactionEl) {
            const compMap = { 'Low': 30, 'Medium': 60, 'High': 90 };
            compactionEl.style.width = compMap[compaction] + '%';
        }
        if (compactionVal) compactionVal.textContent = compaction;
        if (organicEl) {
            const orgMap = { 'Low': 30, 'Medium': 60, 'High': 90 };
            organicEl.style.width = orgMap[organic] + '%';
        }
        if (organicVal) organicVal.textContent = organic;

        // Update recommendations
        const recContainer = document.getElementById('soilRecommendations');
        if (recContainer) {
            const recs = [];
            if (moisture < 40) recs.push('💧 Increase watering frequency');
            else if (moisture > 80) recs.push('💧 Reduce watering - soil is too wet');
            
            if (ph < 5.5) recs.push('🧪 Add lime to raise pH');
            else if (ph > 7.5) recs.push('🧪 Add sulfur to lower pH');
            
            if (compaction === 'High') recs.push('🌱 Aerate soil to improve drainage');
            if (organic === 'Low') recs.push('🌿 Add organic compost to improve soil structure');

            if (recs.length === 0) recs.push('✅ Soil conditions are optimal');

            recContainer.innerHTML = `
                <h4>💡 Recommendations</h4>
                <ul>
                    ${recs.map(r => `<li>${r}</li>`).join('')}
                </ul>
            `;
        }
    }

    // Initialize on load
    document.addEventListener('DOMContentLoaded', init);

    // Expose RootScanner
    window.RootScanner = {
        init: init,
        scan: performRootScan,
        draw: drawRootVisualization
    };

})();
