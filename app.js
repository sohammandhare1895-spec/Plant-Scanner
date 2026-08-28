// app.js - Main application controller

(function() {
    'use strict';

    // Initialize application
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🌾 CropDoc Pro v2.0 initialized');

        // Update live time
        updateLiveTime();
        setInterval(updateLiveTime, 1000);

        // Load data
        if (window.DataManager) {
            window.DataManager.loadAll();
            updateDashboardStats();
        }

        // Handle navigation
        setupNavigation();

        // Initialize modules based on page
        const page = getCurrentPage();
        initializePage(page);

        console.log('✅ App ready');
    });

    function updateLiveTime() {
        const el = document.getElementById('liveTime');
        if (el) {
            const now = new Date();
            el.textContent = now.toLocaleString();
        }
    }

    function getCurrentPage() {
        const path = window.location.pathname;
        const page = path.split('/').pop().split('.')[0] || 'index';
        return page;
    }

    function setupNavigation() {
        // Highlight current page
        const current = getCurrentPage();
        document.querySelectorAll('.nav-links a').forEach(link => {
            const href = link.getAttribute('href');
            if (href && href.includes(current)) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    function initializePage(page) {
        switch(page) {
            case 'index':
                if (window.UI) window.UI.initHome();
                break;
            case 'scanner':
                if (window.Camera) window.Camera.init();
                if (window.AI) window.AI.start(2000);
                if (window.Scanner) window.Scanner.init();
                break;
            case 'gallery':
                if (window.Gallery) window.Gallery.init();
                break;
            case 'analytics':
                if (window.Analytics) window.Analytics.init();
                break;
            case 'reports':
                if (window.Reports) window.Reports.init();
                break;
            case 'settings':
                if (window.Settings) window.Settings.init();
                break;
        }
    }

    function updateDashboardStats() {
        const metrics = window.DataManager ? window.DataManager.getMetrics() : null;
        if (!metrics) return;

        const el = (id) => document.getElementById(id);
        if (el('totalScans')) el('totalScans').textContent = metrics.totalScans || 0;
        if (el('healthyPlants')) el('healthyPlants').textContent = metrics.healthyCount || 0;
        if (el('detectedDiseases')) el('detectedDiseases').textContent = metrics.diseaseCount || 0;
        if (el('accuracyRate')) el('accuracyRate').textContent = (metrics.accuracy || 94) + '%';
    }

    // Expose app API
    window.App = {
        getPage: getCurrentPage,
        updateStats: updateDashboardStats
    };

})();
