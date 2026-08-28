// root-analyzer.js - Root system analysis

(function() {
    'use strict';

    let rootData = null;

    function analyzeRoots(imageData) {
        // Simulate root analysis
        const healthStatus = ['Excellent', 'Good', 'Moderate', 'Poor'];
        const health = healthStatus[Math.floor(Math.random() * healthStatus.length)];
        
        rootData = {
            depth: 20 + Math.random() * 30,
            health: health,
            density: 60 + Math.random() * 35,
            moisture: 40 + Math.random() * 50,
            status: health,
            recommendations: getRecommendations(health),
            timestamp: new Date().toISOString()
        };

        return rootData;
    }

    function getRecommendations(health) {
        const recommendations = {
            'Excellent': [
                'Root system is healthy and well-developed',
                'Continue current care regimen',
                'Consider adding beneficial microbes for optimal growth'
            ],
            'Good': [
                'Root system shows good development',
                'Maintain current watering schedule',
                'Add organic matter to support growth'
            ],
            'Moderate': [
                'Roots show signs of stress',
                'Adjust watering frequency',
                'Check for compaction and aerate soil'
            ],
            'Poor': [
                'Root rot detected',
                'Reduce watering immediately',
                'Apply fungicide treatment',
                'Consider transplanting to fresh soil'
            ]
        };
        return recommendations[health] || recommendations['Good'];
    }

    function getRootData() {
        return rootData;
    }

    function renderRootAnalysis(container) {
        if (!rootData || !container) return;

        const statusColors = {
            'Excellent': '#4caf50',
            'Good': '#8bc34a',
            'Moderate': '#ff9800',
            'Poor': '#f44336'
        };

        container.innerHTML = `
            <div class="root-analysis-container">
                <div class="root-metrics">
                    <div class="root-metric-card">
                        <span class="metric-icon">📏</span>
                        <span class="metric-label">Depth</span>
                        <span class="metric-value">${Math.round(rootData.depth)} cm</span>
                    </div>
                    <div class="root-metric-card">
                        <span class="metric-icon">💚</span>
                        <span class="metric-label">Health</span>
                        <span class="metric-value" style="color:${statusColors[rootData.health]}">${rootData.health}</span>
                    </div>
                    <div class="root-metric-card">
                        <span class="metric-icon">📊</span>
                        <span class="metric-label">Density</span>
                        <span class="metric-value">${Math.round(rootData.density)}%</span>
                    </div>
                    <div class="root-metric-card">
                        <span class="metric-icon">💧</span>
                        <span class="metric-label">Moisture</span>
                        <span class="metric-value">${Math.round(rootData.moisture)}%</span>
                    </div>
                </div>
                <div class="root-recommendations">
                    <h4><i class="fas fa-lightbulb"></i> Recommendations</h4>
                    <ul>
                        ${rootData.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>
                <div class="root-visualization">
                    <canvas id="rootVizCanvas" width="300" height="200"></canvas>
                </div>
            </div>
        `;

        // Draw root visualization
        drawRootVisualization('rootVizCanvas', rootData);
    }

    function drawRootVisualization(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        // Draw soil
        const grad = ctx.createLinearGradient(0, 0, 0, h);
        grad.addColorStop(0, '#5d4037');
        grad.addColorStop(0.3, '#4e342e');
        grad.addColorStop(0.7, '#3e2723');
        grad.addColorStop(1, '#1b0e0b');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, w, h);

        // Draw roots based on health
        const healthScore = {
            'Excellent': 0.9,
            'Good': 0.7,
            'Moderate': 0.5,
            'Poor': 0.3
        };

        const score = healthScore[data.health] || 0.5;
        const rootCount = Math.floor(20 + score * 30);
        const density = data.density / 100;

        ctx.strokeStyle = '#8d6e63';
        ctx.lineWidth = 2;

        for (let i = 0; i < rootCount; i++) {
            const x = 20 + Math.random() * (w - 40);
            const y = h - 20 - Math.random() * 40;
            const length = 30 + Math.random() * 60 * score;
            const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.8;

            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);

            // Branches
            if (Math.random() > 0.6) {
                const bx = x + Math.cos(angle) * length * 0.6;
                const by = y + Math.sin(angle) * length * 0.6;
                const bAngle = angle + (Math.random() - 0.5) * 1.2;
                const bLength = length * 0.4;
                ctx.moveTo(bx, by);
                ctx.lineTo(bx + Math.cos(bAngle) * bLength, by + Math.sin(bAngle) * bLength);
            }

            ctx.stroke();
        }

        // Add health indicator
        ctx.fillStyle = 'rgba(0,0,0,0.6)';
        ctx.fillRect(10, 10, 100, 25);
        ctx.fillStyle = '#fff';
        ctx.font = '12px Inter, sans-serif';
        ctx.fillText(`Health: ${data.health}`, 18, 28);

        // Health bar
        const barX = 120;
        const barY = 15;
        const barWidth = 100;
        const barHeight = 8;
        ctx.fillStyle = '#333';
        ctx.fillRect(barX, barY, barWidth, barHeight);
        ctx.fillStyle = statusColors[data.health] || '#4caf50';
        ctx.fillRect(barX, barY, barWidth * score, barHeight);
    }

    const statusColors = {
        'Excellent': '#4caf50',
        'Good': '#8bc34a',
        'Moderate': '#ff9800',
        'Poor': '#f44336'
    };

    // Expose RootAnalyzer
    window.RootAnalyzer = {
        analyze: analyzeRoots,
        getData: getRootData,
        render: renderRootAnalysis
    };

})();
