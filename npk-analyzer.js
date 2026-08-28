// npk-analyzer.js - NPK analysis simulation

(function() {
    'use strict';

    let currentNPK = {
        nitrogen: 45,
        phosphorus: 30,
        potassium: 60
    };

    function update() {
        // Simulate NPK values based on crop and condition
        const diagnosis = window.AI ? window.AI.getDiagnosis() : null;
        let base = { n: 45, p: 30, k: 60 };

        if (diagnosis) {
            // Adjust based on crop
            const cropMap = {
                'Tomato': { n: 50, p: 35, k: 55 },
                'Wheat': { n: 60, p: 25, k: 50 },
                'Maize': { n: 70, p: 30, k: 45 },
                'Rice': { n: 55, p: 25, k: 50 },
                'Potato': { n: 45, p: 40, k: 60 },
                'Soybean': { n: 40, p: 35, k: 55 }
            };

            const crop = diagnosis.crop || 'Tomato';
            if (cropMap[crop]) {
                base = cropMap[crop];
            }

            // Adjust based on condition
            if (diagnosis.condition === 'Nitrogen Deficiency') {
                base.n = Math.max(20, base.n - 30);
            } else if (diagnosis.condition.includes('Rust') || diagnosis.condition.includes('Blight')) {
                base.p = Math.max(20, base.p - 15);
                base.k = Math.max(20, base.k - 10);
            }
        }

        // Add randomness
        const noise = () => (Math.random() - 0.5) * 8;
        currentNPK = {
            nitrogen: Math.max(15, Math.min(85, base.n + noise())),
            phosphorus: Math.max(15, Math.min(80, base.p + noise())),
            potassium: Math.max(15, Math.min(85, base.k + noise()))
        };

        updateUI();
        return currentNPK;
    }

    function updateUI() {
        const nFill = document.getElementById('nFill');
        const pFill = document.getElementById('pFill');
        const kFill = document.getElementById('kFill');
        const nValue = document.getElementById('nValue');
        const pValue = document.getElementById('pValue');
        const kValue = document.getElementById('kValue');
        const status = document.getElementById('npkStatus');

        if (nFill) nFill.style.width = currentNPK.nitrogen + '%';
        if (pFill) pFill.style.width = currentNPK.phosphorus + '%';
        if (kFill) kFill.style.width = currentNPK.potassium + '%';
        if (nValue) nValue.textContent = Math.round(currentNPK.nitrogen) + '%';
        if (pValue) pValue.textContent = Math.round(currentNPK.phosphorus) + '%';
        if (kValue) kValue.textContent = Math.round(currentNPK.potassium) + '%';

        if (status) {
            const ratio = `${Math.round(currentNPK.nitrogen/10)}-${Math.round(currentNPK.phosphorus/10)}-${Math.round(currentNPK.potassium/10)}`;
            const total = currentNPK.nitrogen + currentNPK.phosphorus + currentNPK.potassium;
            let recommendation = 'Optimal';
            let emoji = '🌱';
            if (currentNPK.nitrogen < 30) { recommendation = 'Nitrogen deficiency'; emoji = '⚠️'; }
            else if (currentNPK.phosphorus < 25) { recommendation = 'Phosphorus deficiency'; emoji = '⚠️'; }
            else if (currentNPK.potassium < 30) { recommendation = 'Potassium deficiency'; emoji = '⚠️'; }
            else if (total > 200) { recommendation = 'Over-fertilized'; emoji = '⚡'; }

            status.textContent = `${emoji} NPK Ratio: ${ratio} · ${recommendation}`;
        }
    }

    function getNPK() {
        return { ...currentNPK };
    }

    function getRecommendation() {
        const n = currentNPK.nitrogen;
        const p = currentNPK.phosphorus;
        const k = currentNPK.potassium;

        if (n < 30) return { nutrient: 'Nitrogen', suggestion: 'Add organic compost or urea' };
        if (p < 25) return { nutrient: 'Phosphorus', suggestion: 'Add bone meal or rock phosphate' };
        if (k < 30) return { nutrient: 'Potassium', suggestion: 'Add wood ash or potash' };
        if (n > 75 && p > 60 && k > 75) return { nutrient: 'All', suggestion: 'Reduce fertilizer application' };
        return { nutrient: 'Balanced', suggestion: 'Maintain current NPK levels' };
    }

    // Expose NPK Analyzer
    window.NPKAnalyzer = {
        update: update,
        getNPK: getNPK,
        getRecommendation: getRecommendation,
        updateUI: updateUI
    };

    // Auto-update periodically
    setInterval(() => {
        if (document.querySelector('.npk-panel')) {
            update();
        }
    }, 3000);

})();
