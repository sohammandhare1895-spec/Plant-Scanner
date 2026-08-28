// ui-controller.js - UI management

(function() {
    'use strict';

    function initHome() {
        updateDashboard();
        setupActivityFeed();
    }

    function updateDashboard() {
        if (!window.DataManager) return;
        const metrics = window.DataManager.getMetrics();

        const els = {
            totalScans: document.getElementById('totalScans'),
            healthyPlants: document.getElementById('healthyPlants'),
            detectedDiseases: document.getElementById('detectedDiseases'),
            accuracyRate: document.getElementById('accuracyRate')
        };

        if (els.totalScans) els.totalScans.textContent = metrics.totalScans || 0;
        if (els.healthyPlants) els.healthyPlants.textContent = metrics.healthyCount || 0;
        if (els.detectedDiseases) els.detectedDiseases.textContent = metrics.diseaseCount || 0;
        if (els.accuracyRate) els.accuracyRate.textContent = (metrics.accuracy || 94) + '%';
    }

    function setupActivityFeed() {
        const container = document.getElementById('activityList');
        if (!container) return;

        // Initial activity
        const activities = [
            { icon: 'fa-camera', title: 'Tomato scan completed', desc: 'Early Blight detected', time: '2 min ago' },
            { icon: 'fa-chart-line', title: 'Analytics updated', desc: 'NPK analysis completed', time: '15 min ago' },
            { icon: 'fa-file-pdf', title: 'Report generated', desc: 'Weekly crop health report', time: '1 hour ago' }
        ];

        container.innerHTML = activities.map(act => `
            <div class="activity-item">
                <i class="fas ${act.icon}"></i>
                <div class="activity-info">
                    <span class="activity-title">${act.title}</span>
                    <span class="activity-desc">${act.desc}</span>
                </div>
                <span class="activity-time">${act.time}</span>
            </div>
        `).join('');

        // Update periodically
        setInterval(() => {
            const event = window.DataManager ? window.DataManager.generateEvent() : null;
            if (event && container) {
                const newItem = document.createElement('div');
                newItem.className = 'activity-item';
                newItem.innerHTML = `
                    <i class="fas fa-seedling"></i>
                    <div class="activity-info">
                        <span class="activity-title">${event.type}</span>
                        <span class="activity-desc">${event.crop} — ${event.condition || 'Analyzed'}</span>
                    </div>
                    <span class="activity-time">Just now</span>
                `;
                container.prepend(newItem);
                if (container.children.length > 10) {
                    container.removeChild(container.lastChild);
                }
            }
        }, 10000);
    }

    function updateDiagnosis(diagnosis) {
        const elements = {
            cropName: document.getElementById('cropName'),
            cropCondition: document.getElementById('cropCondition'),
            confidenceFill: document.getElementById('confidenceFill'),
            confidenceValue: document.getElementById('confidenceValue'),
            sym1: document.getElementById('sym1'),
            cause: document.getElementById('cause'),
            fert: document.getElementById('fert'),
            organic: document.getElementById('organic'),
            dosage: document.getElementById('dosage')
        };

        if (!diagnosis) {
            Object.values(elements).forEach(el => {
                if (el) el.textContent = '—';
            });
            if (elements.confidenceFill) elements.confidenceFill.style.width = '0%';
            if (elements.confidenceValue) elements.confidenceValue.textContent = '0%';
            return;
        }

        if (elements.cropName) elements.cropName.textContent = diagnosis.crop || '—';
        if (elements.cropCondition) elements.cropCondition.textContent = diagnosis.condition || 'Unknown';

        const confidence = diagnosis.confidence || 0;
        if (elements.confidenceFill) elements.confidenceFill.style.width = Math.min(100, confidence) + '%';
        if (elements.confidenceValue) elements.confidenceValue.textContent = Math.round(confidence) + '%';

        if (elements.sym1) {
            const syms = diagnosis.symptoms || [];
            elements.sym1.textContent = syms.length ? syms.slice(0, 2).join(' · ') : '—';
        }
        if (elements.cause) elements.cause.textContent = diagnosis.cause || '—';
        if (elements.fert) elements.fert.textContent = diagnosis.fertilizer || '—';
        if (elements.organic) elements.organic.textContent = diagnosis.organic || '—';
        if (elements.dosage) elements.dosage.textContent = diagnosis.dosage || '—';

        // Update status badge
        if (window.Camera) {
            const type = confidence >= 75 ? 'scanning' : 'unclear';
            window.Camera.updateStatus('DETECTED', type);
        }
    }

    function setFeedback(msg) {
        const el = document.getElementById('liveFeedback');
        if (el) {
            el.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
        }
    }

    // Expose UI controller
    window.UI = {
        initHome: initHome,
        updateDashboard: updateDashboard,
        updateDiagnosis: updateDiagnosis,
        setFeedback: setFeedback
    };

})();
