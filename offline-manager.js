// offline-manager.js - Offline support with Service Worker

(function() {
    'use strict';

    let isOnline = navigator.onLine;
    let pendingUploads = [];

    function init() {
        // Monitor online/offline status
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        
        // Register service worker
        registerServiceWorker();
        
        // Load pending uploads
        loadPendingUploads();
        
        // Show status
        updateStatus();
        
        console.log('📡 Offline manager initialized');
    }

    function registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('/sw.js')
                .then(() => console.log('✅ Service Worker registered'))
                .catch(err => console.warn('Service Worker registration failed:', err));
        }
    }

    function handleOnline() {
        isOnline = true;
        updateStatus();
        processPendingUploads();
        showNotification('🔄 Back online! Syncing data...');
    }

    function handleOffline() {
        isOnline = false;
        updateStatus();
        showNotification('📴 You are offline. Changes will be saved locally.');
    }

    function updateStatus() {
        const statusEl = document.getElementById('offlineStatus');
        if (statusEl) {
            statusEl.textContent = isOnline ? '🟢 Online' : '🔴 Offline';
            statusEl.style.color = isOnline ? '#4caf50' : '#f44336';
        }
    }

    function loadPendingUploads() {
        try {
            const saved = localStorage.getItem('cropdoc_pending_uploads');
            if (saved) {
                pendingUploads = JSON.parse(saved);
                if (pendingUploads.length > 0 && isOnline) {
                    processPendingUploads();
                }
            }
        } catch (e) {
            console.warn('Failed to load pending uploads:', e);
        }
    }

    function savePendingUploads() {
        try {
            localStorage.setItem('cropdoc_pending_uploads', JSON.stringify(pendingUploads));
        } catch (e) {
            console.warn('Failed to save pending uploads:', e);
        }
    }

    function addPendingUpload(data) {
        pendingUploads.push({
            id: Date.now(),
            data: data,
            timestamp: new Date().toISOString(),
            attempts: 0
        });
        savePendingUploads();
        
        if (isOnline) {
            processPendingUploads();
        } else {
            showNotification('📝 Data saved locally. Will sync when online.');
        }
    }

    function processPendingUploads() {
        if (!isOnline || pendingUploads.length === 0) return;

        const uploads = [...pendingUploads];
        let processed = 0;

        uploads.forEach(async (upload, index) => {
            try {
                const response = await fetch('/api/upload', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(upload.data)
                });

                if (response.ok) {
                    pendingUploads = pendingUploads.filter(u => u.id !== upload.id);
                    processed++;
                    savePendingUploads();
                    showNotification(`✅ ${processed} items synced`);
                }
            } catch (err) {
                upload.attempts++;
                if (upload.attempts > 3) {
                    pendingUploads = pendingUploads.filter(u => u.id !== upload.id);
                    console.warn('Upload failed after 3 attempts:', upload.id);
                }
                savePendingUploads();
            }
        });
    }

    function showNotification(message) {
        const toast = document.createElement('div');
        toast.className = 'offline-toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            background: var(--bg-card);
            color: var(--text-light);
            padding: 12px 20px;
            border-radius: 12px;
            border: 1px solid var(--border-color);
            z-index: 1000;
            animation: slideIn 0.3s ease;
            max-width: 300px;
            box-shadow: 0 4px 20px rgba(0,0,0,0.4);
            font-size: 0.9rem;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }

    // Add styles for notifications
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideIn {
            from { opacity: 0; transform: translateX(20px); }
            to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideOut {
            from { opacity: 1; transform: translateX(0); }
            to { opacity: 0; transform: translateX(20px); }
        }
    `;
    document.head.appendChild(style);

    // Expose OfflineManager
    window.OfflineManager = {
        init: init,
        isOnline: () => isOnline,
        addPendingUpload: addPendingUpload,
        processPending: processPendingUploads,
        getPendingCount: () => pendingUploads.length
    };

    // Auto-init
    document.addEventListener('DOMContentLoaded', init);

})();
