// camera.js - Webcam management

(function() {
    'use strict';

    const video = document.getElementById('webcam');
    const canvas = document.getElementById('overlayCanvas');
    const ctx = canvas ? canvas.getContext('2d') : null;

    let stream = null;
    let isReady = false;

    function resizeCanvas() {
        if (!canvas) return;
        const wrapper = document.getElementById('cameraWrapper');
        if (!wrapper) return;
        const rect = wrapper.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
    }

    async function init() {
        try {
            const constraints = {
                video: {
                    facingMode: 'environment',
                    width: { ideal: 1280 },
                    height: { ideal: 720 }
                }
            };

            stream = await navigator.mediaDevices.getUserMedia(constraints);
            video.srcObject = stream;
            await video.play();

            isReady = true;
            resizeCanvas();
            updateStatus('Ready', 'scanning');
            setFeedback('📷 Camera ready');

            return true;
        } catch (err) {
            console.warn('Camera init error:', err);
            isReady = false;
            updateStatus('No Camera', 'error');
            setFeedback('⚠️ Camera access denied');
            return false;
        }
    }

    function updateStatus(label, type) {
        const dot = document.getElementById('statusDot');
        const labelEl = document.getElementById('statusLabel');
        if (dot) {
            dot.className = 'status-dot';
            if (type) dot.classList.add(type);
        }
        if (labelEl) labelEl.textContent = label;
    }

    function setFeedback(msg) {
        const el = document.getElementById('liveFeedback');
        if (el) {
            el.innerHTML = `<i class="fas fa-info-circle"></i> ${msg}`;
        }
    }

    function drawOverlay(detections) {
        if (!ctx || !canvas) return;
        const w = canvas.width;
        const h = canvas.height;

        ctx.clearRect(0, 0, w, h);

        if (!detections || !detections.length) return;

        detections.forEach((d, i) => {
            const x = d.x * w;
            const y = d.y * h;
            const bw = d.w * w;
            const bh = d.h * h;

            // Bounding box with glow
            ctx.shadowColor = d.color || '#6fbf6f';
            ctx.shadowBlur = 15;
            ctx.strokeStyle = d.color || '#6fbf6f';
            ctx.lineWidth = 3;
            ctx.strokeRect(x, y, bw, bh);
            ctx.shadowBlur = 0;

            // Label
            const label = `${d.label || 'Crop'} ${Math.round((d.confidence || 0) * 100)}%`;
            ctx.font = 'bold 14px Inter, sans-serif';
            const metrics = ctx.measureText(label);
            const tw = metrics.width + 16;
            const th = 30;

            ctx.fillStyle = 'rgba(0,0,0,0.8)';
            ctx.fillRect(x, y - th, tw, th);

            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 13px Inter, sans-serif';
            ctx.fillText(label, x + 8, y - 8);
        });
    }

    function capture() {
        if (!isReady || !video.videoWidth) return null;

        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = video.videoWidth;
        tempCanvas.height = video.videoHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(video, 0, 0);

        // Apply current filter if any
        const activeFilter = document.querySelector('.filter-option.active');
        if (activeFilter && window.Filters) {
            const filterName = activeFilter.dataset.filter;
            if (filterName !== 'normal') {
                window.Filters.applyToCanvas(tempCanvas, filterName);
            }
        }

        return tempCanvas;
    }

    function isCameraReady() {
        return isReady;
    }

    // Resize on window change
    window.addEventListener('resize', () => {
        if (window.Camera) window.Camera.resize();
    });

    // Expose Camera API
    window.Camera = {
        init: init,
        resize: resizeCanvas,
        drawOverlay: drawOverlay,
        capture: capture,
        isReady: isCameraReady,
        updateStatus: updateStatus,
        setFeedback: setFeedback
    };

})();
