// settings.js - Settings management

(function() {
    'use strict';

    let settings = {};

    function init() {
        loadSettings();
        setupEventListeners();
        updateStorageInfo();
    }

    function loadSettings() {
        try {
            const saved = localStorage.getItem('cropdoc_settings');
            if (saved) {
                settings = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load settings:', e);
        }
        applySettings();
    }

    function saveSettings() {
        try {
            localStorage.setItem('cropdoc_settings', JSON.stringify(settings));
        } catch (e) {
            console.warn('Failed to save settings:', e);
        }
    }

    function applySettings() {
        // Theme
        if (settings.theme) {
            document.documentElement.setAttribute('data-theme', settings.theme);
        }

        // Language
        if (settings.language) {
            document.documentElement.lang = settings.language;
        }

        // Camera settings
        const resolution = document.getElementById('cameraResolution');
        if (resolution && settings.resolution) {
            resolution.value = settings.resolution;
        }

        const facing = document.getElementById('facingMode');
        if (facing && settings.facing) {
            facing.value = settings.facing;
        }

        // AI settings
        const interval = document.getElementById('detectionInterval');
        if (interval && settings.interval) {
            interval.value = settings.interval;
        }

        const threshold = document.getElementById('confidenceThreshold');
        const thresholdValue = document.getElementById('thresholdValue');
        if (threshold && settings.threshold) {
            threshold.value = settings.threshold;
            if (thresholdValue) thresholdValue.textContent = settings.threshold + '%';
        }
    }

    function setupEventListeners() {
        // Camera resolution
        document.getElementById('cameraResolution')?.addEventListener('change', function() {
            settings.resolution = this.value;
            saveSettings();
        });

        // Facing mode
        document.getElementById('facingMode')?.addEventListener('change', function() {
            settings.facing = this.value;
            saveSettings();
        });

        // Frame rate
        document.getElementById('frameRate')?.addEventListener('change', function() {
            settings.framerate = this.value;
            saveSettings();
        });

        // Detection interval
        document.getElementById('detectionInterval')?.addEventListener('change', function() {
            settings.interval = this.value;
            saveSettings();
            if (window.AI) {
                window.AI.stop();
                window.AI.start(parseInt(this.value));
            }
        });

        // Confidence threshold
        document.getElementById('confidenceThreshold')?.addEventListener('input', function() {
            const value = this.value;
            document.getElementById('thresholdValue').textContent = value + '%';
            settings.threshold = parseInt(value);
            saveSettings();
        });

        // Theme
        document.getElementById('themeSelect')?.addEventListener('change', function() {
            settings.theme = this.value;
            saveSettings();
            applySettings();
        });

        // Language
        document.getElementById('languageSelect')?.addEventListener('change', function() {
            settings.language = this.value;
            saveSettings();
            applySettings();
        });

        // Auto-save
        document.querySelector('input[type="checkbox"]')?.addEventListener('change', function() {
            settings.autoSave = this.checked;
            saveSettings();
        });

        // Export data
        document.getElementById('exportDataBtn')?.addEventListener('click', exportData);

        // Import data
        document.getElementById('importDataBtn')?.addEventListener('click', importData);

        // Clear data
        document.getElementById('clearDataBtn')?.addEventListener('click', clearAllData);
    }

    function exportData() {
        const data = {
            settings: settings,
            gallery: localStorage.getItem('cropdoc_gallery'),
            history: localStorage.getItem('cropdoc_history'),
            reports: localStorage.getItem('cropdoc_reports'),
            exportDate: new Date().toISOString()
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cropdoc_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        alert('✅ Data exported successfully!');
    }

    function importData() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = function(e) {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = function(event) {
                try {
                    const data = JSON.parse(event.target.result);
                    if (data.settings) {
                        settings = data.settings;
                        saveSettings();
                        applySettings();
                    }
                    if (data.gallery) localStorage.setItem('cropdoc_gallery', data.gallery);
                    if (data.history) localStorage.setItem('cropdoc_history', data.history);
                    if (data.reports) localStorage.setItem('cropdoc_reports', data.reports);
                    alert('✅ Data imported successfully! Reload page to see changes.');
                } catch (err) {
                    alert('❌ Invalid backup file');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    function clearAllData() {
        if (!confirm('⚠️ This will delete ALL data. Are you sure?')) return;
        if (!confirm('⚠️ Final confirmation: Delete all data?')) return;

        localStorage.removeItem('cropdoc_gallery');
        localStorage.removeItem('cropdoc_history');
        localStorage.removeItem('cropdoc_reports');
        localStorage.removeItem('cropdoc_settings');
        alert('✅ All data cleared. Reloading...');
        location.reload();
    }

    function updateStorageInfo() {
        let totalSize = 0;
        const keys = ['cropdoc_gallery', 'cropdoc_history', 'cropdoc_reports', 'cropdoc_settings'];
        keys.forEach(key => {
            const data = localStorage.getItem(key);
            if (data) totalSize += data.length * 0.75; // Approximate size in bytes
        });

        const el = document.getElementById('storageUsed');
        if (el) {
            el.textContent = (totalSize / 1024 / 1024).toFixed(2) + ' MB';
        }
    }

    // Expose Settings API
    window.Settings = {
        init: init,
        get: () => settings,
        set: (key, value) => {
            settings[key] = value;
            saveSettings();
            applySettings();
        }
    };

})();
