// analytics.js - Analytics and charts

(function() {
    'use strict';

    let charts = {};

    function init() {
        setupTimeFilters();
        createCharts();
        updateCharts();
        generateHeatmap();
        setupPredictions();
    }

    function setupTimeFilters() {
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.addEventListener('click', function() {
                document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                updateCharts(this.dataset.period);
            });
        });
    }

    function createCharts() {
        // Disease Distribution Chart
        const diseaseCtx = document.getElementById('diseaseChart')?.getContext('2d');
        if (diseaseCtx) {
            charts.disease = new Chart(diseaseCtx, {
                type: 'doughnut',
                data: {
                    labels: ['Early Blight', 'Leaf Rust', 'Nitrogen Deficiency', 'Bacterial Blight', 'Healthy'],
                    datasets: [{
                        data: [35, 25, 15, 10, 15],
                        backgroundColor: ['#ff6b6b', '#ffa94d', '#f5b342', '#42a5f5', '#6fbf6f'],
                        borderWidth: 2,
                        borderColor: '#1a2b1b'
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            position: 'bottom',
                            labels: { color: '#d4edc9' }
                        }
                    }
                }
            });
        }

        // NPK Trends Chart
        const npkCtx = document.getElementById('npkChart')?.getContext('2d');
        if (npkCtx) {
            charts.npk = new Chart(npkCtx, {
                type: 'line',
                data: {
                    labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
                    datasets: [
                        {
                            label: 'Nitrogen',
                            data: [40, 45, 42, 48],
                            borderColor: '#6fbf6f',
                            tension: 0.3
                        },
                        {
                            label: 'Phosphorus',
                            data: [30, 28, 32, 30],
                            borderColor: '#f5b342',
                            tension: 0.3
                        },
                        {
                            label: 'Potassium',
                            data: [55, 58, 60, 62],
                            borderColor: '#42a5f5',
                            tension: 0.3
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: '#d4edc9' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { color: '#90b08b' },
                            grid: { color: '#2d3d2e' }
                        },
                        x: {
                            ticks: { color: '#90b08b' },
                            grid: { color: '#2d3d2e' }
                        }
                    }
                }
            });
        }

        // Confidence Chart
        const confCtx = document.getElementById('confidenceChart')?.getContext('2d');
        if (confCtx) {
            charts.confidence = new Chart(confCtx, {
                type: 'bar',
                data: {
                    labels: ['Tomato', 'Wheat', 'Maize', 'Rice', 'Potato'],
                    datasets: [{
                        label: 'Confidence (%)',
                        data: [84, 88, 79, 81, 86],
                        backgroundColor: ['#6fbf6f', '#6fbf6f', '#f5b342', '#42a5f5', '#6fbf6f'],
                        borderRadius: 4
                    }]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: { display: false }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 100,
                            ticks: { color: '#90b08b' },
                            grid: { color: '#2d3d2e' }
                        },
                        x: {
                            ticks: { color: '#90b08b' },
                            grid: { color: '#2d3d2e' }
                        }
                    }
                }
            });
        }

        // Activity Chart
        const actCtx = document.getElementById('activityChart')?.getContext('2d');
        if (actCtx) {
            charts.activity = new Chart(actCtx, {
                type: 'bar',
                data: {
                    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                    datasets: [
                        {
                            label: 'Scans',
                            data: [12, 19, 8, 15, 22, 10, 5],
                            backgroundColor: '#6fbf6f',
                            borderRadius: 4
                        },
                        {
                            label: 'Diseases',
                            data: [5, 8, 3, 6, 9, 4, 2],
                            backgroundColor: '#ff6b6b',
                            borderRadius: 4
                        }
                    ]
                },
                options: {
                    responsive: true,
                    plugins: {
                        legend: {
                            labels: { color: '#d4edc9' }
                        }
                    },
                    scales: {
                        y: {
                            beginAtZero: true,
                            ticks: { color: '#90b08b' },
                            grid: { color: '#2d3d2e' }
                        },
                        x: {
                            ticks: { color: '#90b08b' },
                            grid: { color: '#2d3d2e' }
                        }
                    }
                }
            });
        }
    }

    function updateCharts(period = 'week') {
        // Simulate data updates based on period
        const multipliers = {
            'week': 1,
            'month': 4,
            'year': 12
        };
        const mult = multipliers[period] || 1;

        if (charts.disease) {
            charts.disease.data.datasets[0].data = charts.disease.data.datasets[0].data.map(d => 
                Math.max(5, d + (Math.random() - 0.5) * 10)
            );
            charts.disease.update();
        }

        if (charts.npk) {
            charts.npk.data.datasets.forEach(ds => {
                ds.data = ds.data.map(v => Math.max(20, Math.min(80, v + (Math.random() - 0.5) * 8)));
            });
            charts.npk.update();
        }

        if (charts.confidence) {
            charts.confidence.data.datasets[0].data = charts.confidence.data.datasets[0].data.map(d => 
                Math.max(50, Math.min(95, d + (Math.random() - 0.5) * 6))
            );
            charts.confidence.update();
        }

        if (charts.activity) {
            charts.activity.data.datasets[0].data = charts.activity.data.datasets[0].data.map(d => 
                Math.max(2, d + (Math.random() - 0.5) * 8 * mult)
            );
            charts.activity.data.datasets[1].data = charts.activity.data.datasets[1].data.map(d => 
                Math.max(1, d + (Math.random() - 0.5) * 4 * mult)
            );
            charts.activity.update();
        }
    }

    function generateHeatmap() {
        const container = document.getElementById('heatmap');
        if (!container) return;

        const regions = ['North', 'South', 'East', 'West'];
        const diseases = ['Blight', 'Rust', 'Deficiency', 'Bacterial'];

        container.innerHTML = '';
        const grid = document.createElement('div');
        grid.className = 'heatmap';

        for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
                const cell = document.createElement('div');
                cell.className = 'heatmap-cell';
                const intensity = 0.1 + Math.random() * 0.9;
                const red = Math.round(255 * intensity);
                const green = Math.round(255 * (1 - intensity * 0.8));
                const blue = Math.round(255 * (1 - intensity * 0.9));
                cell.style.background = `rgb(${red}, ${green}, ${blue})`;
                cell.title = `${regions[r]} · ${diseases[c]}: ${Math.round(intensity * 100)}%`;
                cell.style.aspectRatio = '1';
                grid.appendChild(cell);
            }
        }

        container.appendChild(grid);

        // Add legend
        const legend = document.createElement('div');
        legend.style.cssText = 'margin-top:12px;display:flex;gap:12px;font-size:0.75rem;color:var(--text-muted);';
        legend.innerHTML = `
            <span>🟢 Low</span>
            <span style="flex:1;height:4px;background:linear-gradient(to right,#4caf50,#ffeb3b,#f44336);border-radius:4px;"></span>
            <span>🔴 High</span>
        `;
        container.appendChild(legend);
    }

    function setupPredictions() {
        // Update predictions periodically
        setInterval(() => {
            const items = document.querySelectorAll('.prediction-item');
            items.forEach(item => {
                const value = item.querySelector('.prediction-value');
                if (value) {
                    const current = parseInt(value.textContent);
                    if (!isNaN(current)) {
                        const newVal = Math.max(10, Math.min(95, current + (Math.random() - 0.5) * 10));
                        value.textContent = Math.round(newVal) + '%';
                        value.className = 'prediction-value';
                        if (newVal > 70) value.classList.add('high');
                        else if (newVal > 40) value.classList.add('medium');
                        else value.classList.add('low');
                    }
                }
            });
        }, 5000);
    }

    // Expose Analytics API
    window.Analytics = {
        init: init,
        updateCharts: updateCharts
    };

})();
