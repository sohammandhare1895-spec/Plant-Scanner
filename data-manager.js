// data-manager.js - Data persistence and management

(function() {
    'use strict';

    let data = {
        history: [],
        metrics: {
            totalScans: 0,
            healthyCount: 0,
            diseaseCount: 0,
            commonDisease: 'None',
            accuracy: 94,
            lastScan: null
        }
    };

    function loadAll() {
        loadHistory();
        loadGallery();
        loadReports();
        updateMetrics();
        return data;
    }

    function loadHistory() {
        try {
            const saved = localStorage.getItem('cropdoc_history');
            if (saved) {
                data.history = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load history:', e);
        }
    }

    function loadGallery() {
        try {
            const saved = localStorage.getItem('cropdoc_gallery');
            if (saved) {
                data.gallery = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load gallery:', e);
        }
    }

    function loadReports() {
        try {
            const saved = localStorage.getItem('cropdoc_reports');
            if (saved) {
                data.reports = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load reports:', e);
        }
    }

    function saveHistory() {
        try {
            localStorage.setItem('cropdoc_history', JSON.stringify(data.history));
        } catch (e) {
            console.warn('Failed to save history:', e);
        }
    }

    function recordDetection(detections, imageData) {
        if (!detections || detections.length === 0) return;

        const primary = detections[0];
        const entry = {
            id: Date.now(),
            timestamp: new Date().toISOString(),
            crop: primary.label || 'Unknown',
            condition: primary.condition || 'Unknown',
            confidence: Math.round((primary.confidence || 0) * 100),
            disease: primary.disease || null,
            detections: detections.map(d => ({
                label: d.label,
                condition: d.condition,
                confidence: Math.round((d.confidence || 0) * 100)
            })),
            imageData: imageData || null
        };

        data.history.unshift(entry);
        if (data.history.length > 100) data.history.pop();

        updateMetrics();
        saveHistory();
        return entry;
    }

    function updateMetrics() {
        const history = data.history;
        data.metrics.totalScans = history.length;

        let diseaseCount = 0;
        let healthyCount = 0;
        const diseaseCounts = {};

        history.forEach(entry => {
            if (entry.condition === 'Healthy' || entry.condition === 'Good') {
                healthyCount++;
            } else {
                diseaseCount++;
                const name = entry.condition || 'Unknown';
                diseaseCounts[name] = (diseaseCounts[name] || 0) + 1;
            }
        });

        data.metrics.diseaseCount = diseaseCount;
        data.metrics.healthyCount = healthyCount;

        // Find most common disease
        let maxCount = 0;
        let mostCommon = 'None';
        for (const [name, count] of Object.entries(diseaseCounts)) {
            if (count > maxCount) {
                maxCount = count;
                mostCommon = name;
            }
        }
        data.metrics.commonDisease = mostCommon;

        if (history.length > 0) {
            data.metrics.lastScan = history[0].timestamp;
        }

        // Update accuracy (simulated)
        data.metrics.accuracy = 92 + Math.random() * 5;
    }

    function getHistory() {
        return data.history;
    }

    function getMetrics() {
        return { ...data.metrics };
    }

    function clearAll() {
        data.history = [];
        data.metrics = {
            totalScans: 0,
            healthyCount: 0,
            diseaseCount: 0,
            commonDisease: 'None',
            accuracy: 94,
            lastScan: null
        };
        saveHistory();
    }

    function generateEvent() {
        const types = ['📸 Scan', '🔍 Detection', '📊 Analysis', '🌾 Crop detected'];
        const crops = ['Tomato', 'Wheat', 'Maize', 'Rice', 'Potato', 'Soybean'];
        const conditions = ['Healthy', 'Early Blight', 'Leaf Rust', 'Nitrogen Deficiency', 'Bacterial Blight'];

        return {
            type: types[Math.floor(Math.random() * types.length)],
            crop: crops[Math.floor(Math.random() * crops.length)],
            condition: conditions[Math.floor(Math.random() * conditions.length)],
            timestamp: new Date().toISOString()
        };
    }

    // Expose DataManager
    window.DataManager = {
        loadAll: loadAll,
        recordDetection: recordDetection,
        getHistory: getHistory,
        getMetrics: getMetrics,
        clearAll: clearAll,
        generateEvent: generateEvent
    };

})();
