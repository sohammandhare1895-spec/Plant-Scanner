// ai-engine.js - AI disease detection engine

(function() {
    'use strict';

    const diseaseDatabase = [
        {
            crop: 'Tomato',
            condition: 'Early Blight',
            confidence: 84,
            symptoms: ['Dark concentric rings', 'Yellow halos on leaves'],
            cause: 'Fungal (Alternaria solani)',
            fertilizer: 'Copper-based fungicide',
            organic: 'Neem oil + baking soda spray',
            dosage: '20ml per 5L water, apply weekly'
        },
        {
            crop: 'Wheat',
            condition: 'Leaf Rust',
            confidence: 88,
            symptoms: ['Orange/red pustules', 'Chlorotic spots'],
            cause: 'Fungal (Puccinia triticina)',
            fertilizer: 'Propiconazole-based spray',
            organic: 'Sulfur dust + compost tea',
            dosage: '15ml per 4L, apply every 10 days'
        },
        {
            crop: 'Maize',
            condition: 'Nitrogen Deficiency',
            confidence: 79,
            symptoms: ['V-shaped yellowing', 'Stunted growth'],
            cause: 'Nutrient deficiency',
            fertilizer: 'Urea (46-0-0) side-dress',
            organic: 'Compost manure + blood meal',
            dosage: '40g per plant, water in well'
        },
        {
            crop: 'Rice',
            condition: 'Bacterial Blight',
            confidence: 81,
            symptoms: ['Water-soaked lesions', 'Yellowish edges'],
            cause: 'Bacterial (Xanthomonas oryzae)',
            fertilizer: 'Streptomycin sulfate',
            organic: 'Copper oxychloride + garlic extract',
            dosage: '2g per litre, spray at tillering'
        },
        {
            crop: 'Potato',
            condition: 'Late Blight',
            confidence: 86,
            symptoms: ['Dark green/black lesions', 'White fungal growth'],
            cause: 'Fungal (Phytophthora infestans)',
            fertilizer: 'Mancozeb-based fungicide',
            organic: 'Copper sulfate + lime mixture',
            dosage: '25g per 5L, apply every 7 days'
        },
        {
            crop: 'Soybean',
            condition: 'Soybean Rust',
            confidence: 82,
            symptoms: ['Tiny brown spots', 'Yellowing leaves'],
            cause: 'Fungal (Phakopsora pachyrhizi)',
            fertilizer: 'Triazole fungicide',
            organic: 'Sulfur + neem extract',
            dosage: '15ml per 3L, spray at flowering'
        }
    ];

    let detections = [];
    let intervalId = null;
    let isRunning = false;
    let currentDiagnosis = null;

    function generateDetections() {
        const count = 1 + Math.floor(Math.random() * 3);
        const newDetections = [];

        // Primary detection (always a disease)
        const disease = diseaseDatabase[Math.floor(Math.random() * diseaseDatabase.length)];
        currentDiagnosis = disease;

        newDetections.push({
            label: disease.crop,
            condition: disease.condition,
            confidence: disease.confidence / 100,
            color: '#6fbf6f',
            x: 0.15 + Math.random() * 0.4,
            y: 0.15 + Math.random() * 0.4,
            w: 0.15 + Math.random() * 0.2,
            h: 0.15 + Math.random() * 0.2,
            disease: disease
        });

        // Additional detections (noise)
        for (let i = 1; i < count; i++) {
            const other = diseaseDatabase[Math.floor(Math.random() * diseaseDatabase.length)];
            newDetections.push({
                label: other.crop,
                condition: other.condition,
                confidence: 0.4 + Math.random() * 0.4,
                color: '#f5b342',
                x: 0.05 + Math.random() * 0.8,
                y: 0.05 + Math.random() * 0.7,
                w: 0.08 + Math.random() * 0.15,
                h: 0.08 + Math.random() * 0.15,
                disease: other
            });
        }

        return newDetections;
    }

    function updateDetections() {
        detections = generateDetections();

        if (window.Camera) {
            window.Camera.drawOverlay(detections);
        }

        if (window.UI && currentDiagnosis) {
            window.UI.updateDiagnosis(currentDiagnosis);
        }

        return detections;
    }

    function start(interval = 2000) {
        if (intervalId) clearInterval(intervalId);
        isRunning = true;

        // Initial update
        updateDetections();

        intervalId = setInterval(() => {
            if (!isRunning) return;
            updateDetections();
        }, interval);
    }

    function stop() {
        isRunning = false;
        if (intervalId) {
            clearInterval(intervalId);
            intervalId = null;
        }
    }

    function forceScan() {
        const result = updateDetections();

        // Record to data manager
        if (window.DataManager && detections.length > 0) {
            const canvas = window.Camera ? window.Camera.capture() : null;
            const dataUrl = canvas ? canvas.toDataURL('image/png') : null;
            window.DataManager.recordDetection(detections, dataUrl);
        }

        return currentDiagnosis;
    }

    function getDiagnosis() {
        return currentDiagnosis;
    }

    function getDetections() {
        return detections;
    }

    // Expose AI Engine
    window.AI = {
        start: start,
        stop: stop,
        forceScan: forceScan,
        getDiagnosis: getDiagnosis,
        getDetections: getDetections,
        updateDetections: updateDetections,
        generateDetections: generateDetections
    };

})();
