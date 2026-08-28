// scanner-full.js - Enhanced scanner with all features

(function() {
    'use strict';

    let isRecording = false;
    let mediaRecorder = null;
    let recordedChunks = [];
    let currentMode = 'photo'; // photo, video, root

    function init() {
        setupControls();
        setupFilters();
        setupNPK();
        setupRootScan();
        updateUI();
    }

    function setupControls() {
        const photoBtn = document.getElementById('photoBtn');
        const videoBtn = document.getElementById('videoBtn');
        const rootBtn = document.getElementById('rootBtn');
        const filterBtn = document.getElementById('filterBtn');
        const printBtn = document.getElementById('printReportBtn');
        const modeSelect = document.getElementById('scanMode');

        if (photoBtn) {
            photoBtn.addEventListener('click', function() {
                currentMode = 'photo';
                takeSnapshot();
                updateUI();
            });
        }

        if (videoBtn) {
            videoBtn.addEventListener('click', function() {
                toggleRecording();
            });
        }

        if (rootBtn) {
            rootBtn.addEventListener('click', function() {
                currentMode = 'root';
                performRootScan();
                updateUI();
            });
        }

        if (filterBtn) {
            filterBtn.addEventListener('click', function() {
                toggleFilterPanel();
            });
        }

        if (printBtn) {
            printBtn.addEventListener('click', function() {
                printReport();
            });
        }

        if (modeSelect) {
            modeSelect.addEventListener('change', function() {
                currentMode = this.value;
                updateUI();
                if (currentMode === 'root') {
                    performRootScan();
                }
            });
        }
    }

    function takeSnapshot() {
        if (!window.Camera || !window.Camera.isReady()) {
            alert('Camera not ready');
            return;
        }

        const canvas = window.Camera.capture();
        if (!canvas) return;

        // Apply filters if active
        const activeFilter = document.querySelector('.filter-option.active');
        if (activeFilter && window.Filters) {
            const filterName = activeFilter.dataset.filter;
            if (filterName !== 'normal') {
                window.Filters.applyToCanvas(canvas, filterName);
            }
        }

        // Add overlay info
        const ctx = canvas.getContext('2d');
        const diagnosis = window.AI ? window.AI.getDiagnosis() : null;
        if (diagnosis) {
            ctx.fillStyle = 'rgba(0,0,0,0.7)';
            ctx.fillRect(10, 10, 200, 80);
            ctx.fillStyle = '#ffffff';
            ctx.font = 'bold 14px Inter, sans-serif';
            ctx.fillText(`🌾 ${diagnosis.crop || 'Unknown'}`, 20, 35);
            ctx.fillStyle = '#6fbf6f';
            ctx.fillText(`🔬 ${diagnosis.condition || 'Unknown'}`, 20, 58);
            ctx.fillStyle = '#f5b342';
            ctx.fillText(`📊 ${diagnosis.confidence || 0}% confidence`, 20, 78);
        }

        // Save to gallery
        const dataUrl = canvas.toDataURL('image/png');
        if (window.Gallery) {
            window.Gallery.addImage(dataUrl, diagnosis);
        }

        // Update status
        window.Camera.setFeedback('📸 Photo captured!');
        if (navigator.vibrate) navigator.vibrate(50);

        // Show confirmation
        showToast('✅ Photo saved to gallery');
    }

    function toggleRecording() {
        if (isRecording) {
            stopRecording();
        } else {
            startRecording();
        }
    }

    function startRecording() {
        const stream = document.getElementById('webcam').srcObject;
        if (!stream) {
            alert('Camera not available');
            return;
        }

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream, {
            mimeType: 'video/webm;codecs=vp9'
        });

        mediaRecorder.ondataavailable = function(e) {
            if (e.data.size > 0) {
                recordedChunks.push(e.data);
            }
        };

        mediaRecorder.onstop = function() {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const url = URL.createObjectURL(blob);
            if (window.Gallery) {
                window.Gallery.addVideo(url);
            }
            showToast('🎬 Video saved to gallery');
            window.Camera.setFeedback('🎬 Video saved!');
        };

        mediaRecorder.start(1000);
        isRecording = true;

        // Update UI
        const btn = document.getElementById('videoBtn');
        if (btn) {
            btn.innerHTML = '<i class="fas fa-stop"></i>';
            btn.classList.add('recording');
        }

        document.getElementById('statusLabel').textContent = 'RECORDING';
        document.getElementById('statusDot').classList.add('recording');
        window.Camera.setFeedback('🔴 Recording...');
    }

    function stopRecording() {
        if (mediaRecorder && isRecording) {
            mediaRecorder.stop();
            isRecording = false;
            const btn = document.getElementById('videoBtn');
            if (btn) {
                btn.innerHTML = '<i class="fas fa-video"></i>';
                btn.classList.remove('recording');
            }
            document.getElementById('statusLabel').textContent = 'Ready';
            document.getElementById('statusDot').classList.remove('recording');
        }
    }

    function performRootScan() {
        // Simulate root scanning
        window.Camera.setFeedback('🌱 Scanning root system...');

        setTimeout(() => {
            const rootData = {
                depth: `${Math.floor(20 + Math.random() * 30)}cm`,
                health: ['Excellent', 'Good', 'Moderate', 'Poor'][Math.floor(Math.random() * 3)],
                density: `${Math.floor(60 + Math.random() * 35)}%`,
                moisture: `${Math.floor(40 + Math.random() * 50)}%`,
                recommendation: [
                    'Root system is healthy. Continue current care.',
                    'Roots show early signs of stress. Adjust watering.',
                    'Root rot detected. Reduce watering and apply fungicide.',
                    'Roots need more space. Consider transplanting.'
                ][Math.floor(Math.random() * 3)]
            };

            // Display root scan results
            const rootPanel = document.getElementById('rootPanel');
            if (rootPanel) {
                rootPanel.innerHTML = `
                    <div class="root-results">
                        <div class="root-metric">
                            <span>Depth</span>
                            <strong>${rootData.depth}</strong>
                        </div>
                        <div class="root-metric">
                            <span>Health</span>
                            <strong class="root-${rootData.health.toLowerCase()}">${rootData.health}</strong>
                        </div>
                        <div class="root-metric">
                            <span>Density</span>
                            <strong>${rootData.density}</strong>
                        </div>
                        <div class="root-metric">
                            <span>Moisture</span>
                            <strong>${rootData.moisture}</strong>
                        </div>
                        <div class="root-recommendation">
                            <i class="fas fa-lightbulb"></i>
                            ${rootData.recommendation}
                        </div>
                    </div>
                `;
                rootPanel.style.display = 'block';
            }

            showToast('🌱 Root scan complete!');
            window.Camera.setFeedback('✅ Root analysis complete');
        }, 2000);
    }

    function toggleFilterPanel() {
        const panel = document.getElementById('filterPanel');
        if (panel) {
            panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
        }
    }

    function setupFilters() {
        document.querySelectorAll('.filter-option').forEach(el => {
            el.addEventListener('click', function() {
                document.querySelectorAll('.filter-option').forEach(f => f.classList.remove('active'));
                this.classList.add('active');
                const filter = this.dataset.filter;
                applyFilterToVideo(filter);
                showToast(`🎨 Filter: ${filter.charAt(0).toUpperCase() + filter.slice(1)}`);
            });
        });
    }

    function applyFilterToVideo(filter) {
        const video = document.getElementById('webcam');
        if (!video) return;

        const filters = {
            'normal': 'none',
            'grayscale': 'grayscale(100%)',
            'sepia': 'sepia(100%)',
            'invert': 'invert(100%)',
            'blur': 'blur(2px)',
            'sharpen': 'contrast(150%) saturate(150%)',
            'edge': 'contrast(200%) brightness(150%)',
            'heatmap': 'hue-rotate(30deg) saturate(300%)',
            'vivid': 'saturate(200%) contrast(120%)',
            'warm': 'sepia(30%) saturate(150%)'
        };

        video.style.filter = filters[filter] || 'none';
    }

    function setupNPK() {
        // Initial update
        if (window.NPKAnalyzer) {
            window.NPKAnalyzer.update();
        }

        // Auto-update
        setInterval(() => {
            if (window.NPKAnalyzer && document.querySelector('.npk-panel')) {
                window.NPKAnalyzer.update();
            }
        }, 3000);
    }

    function updateUI() {
        const modeLabels = {
            'photo': '📸 Photo Mode',
            'video': '🎬 Video Mode',
            'root': '🌱 Root Scan Mode'
        };

        const statusEl = document.getElementById('statusLabel');
        if (statusEl && modeLabels[currentMode]) {
            statusEl.textContent = modeLabels[currentMode];
        }

        // Update mode indicator
        document.querySelectorAll('.mode-indicator').forEach(el => {
            el.classList.toggle('active', el.dataset.mode === currentMode);
        });
    }

    function printReport() {
        const diagnosis = window.AI ? window.AI.getDiagnosis() : null;
        if (!diagnosis) {
            alert('No diagnosis data to print');
            return;
        }

        const npk = window.NPKAnalyzer ? window.NPKAnalyzer.getNPK() : null;

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            alert('Please allow popups to print');
            return;
        }

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>CropDoc Pro Report</title>
                <style>
                    body { font-family: 'Segoe UI', Arial, sans-serif; padding: 40px; background: #f5f5f5; }
                    .report-container { max-width: 800px; margin: 0 auto; background: white; padding: 40px; border-radius: 12px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
                    h1 { color: #2d5a2d; display: flex; align-items: center; gap: 12px; }
                    .header { border-bottom: 2px solid #2d5a2d; padding-bottom: 20px; margin-bottom: 20px; }
                    .section { margin: 20px 0; padding: 20px; border: 1px solid #e0e0e0; border-radius: 8px; }
                    .section h2 { margin-top: 0; color: #333; }
                    .grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
                    .label { font-weight: 600; color: #666; }
                    .value { color: #333; }
                    .status-badge { display: inline-block; padding: 4px 12px; border-radius: 20px; font-weight: 600; }
                    .status-healthy { background: #4caf50; color: white; }
                    .status-warning { background: #ff9800; color: white; }
                    .status-danger { background: #f44336; color: white; }
                    .footer { margin-top: 40px; color: #888; text-align: center; font-size: 0.9em; border-top: 1px solid #eee; padding-top: 20px; }
                    .npk-bar { height: 8px; background: #e0e0e0; border-radius: 4px; margin: 4px 0; }
                    .npk-fill { height: 100%; border-radius: 4px; }
                    .npk-fill.n { background: #4caf50; }
                    .npk-fill.p { background: #ff9800; }
                    .npk-fill.k { background: #2196f3; }
                </style>
            </head>
            <body>
                <div class="report-container">
                    <div class="header">
                        <h1>🌾 CropDoc Pro</h1>
                        <p style="color:#666;">Plant Health Report</p>
                        <p style="color:#999;font-size:0.9em;">Generated: ${new Date().toLocaleString()}</p>
                    </div>

                    <div class="section">
                        <h2>📋 Diagnosis Summary</h2>
                        <div class="grid">
                            <div><span class="label">Crop:</span> <span class="value">${diagnosis.crop || 'Unknown'}</span></div>
                            <div><span class="label">Condition:</span> <span class="value">${diagnosis.condition || 'Unknown'}</span></div>
                            <div><span class="label">Confidence:</span> <span class="value">${diagnosis.confidence || 0}%</span></div>
                            <div><span class="label">Symptoms:</span> <span class="value">${(diagnosis.symptoms || []).join(', ') || '—'}</span></div>
                        </div>
                    </div>

                    <div class="section">
                        <h2>💊 Treatment Recommendations</h2>
                        <div class="grid">
                            <div><span class="label">Primary Cause:</span> <span class="value">${diagnosis.cause || '—'}</span></div>
                            <div><span class="label">Recommended Fertilizer:</span> <span class="value">${diagnosis.fertilizer || '—'}</span></div>
                            <div><span class="label">Organic Treatment:</span> <span class="value">${diagnosis.organic || '—'}</span></div>
                            <div><span class="label">Dosage:</span> <span class="value">${diagnosis.dosage || '—'}</span></div>
                        </div>
                    </div>

                    ${npk ? `
                    <div class="section">
                        <h2>🧪 NPK Analysis</h2>
                        <div>
                            <div><span class="label">Nitrogen (N):</span> ${Math.round(npk.nitrogen)}%</div>
                            <div class="npk-bar"><div class="npk-fill n" style="width:${npk.nitrogen}%"></div></div>
                        </div>
                        <div>
                            <div><span class="label">Phosphorus (P):</span> ${Math.round(npk.phosphorus)}%</div>
                            <div class="npk-bar"><div class="npk-fill p" style="width:${npk.phosphorus}%"></div></div>
                        </div>
                        <div>
                            <div><span class="label">Potassium (K):</span> ${Math.round(npk.potassium)}%</div>
                            <div class="npk-bar"><div class="npk-fill k" style="width:${npk.potassium}%"></div></div>
                        </div>
                        <p><strong>Status:</strong> ${window.NPKAnalyzer ? window.NPKAnalyzer.getRecommendation().suggestion : '—'}</p>
                    </div>
                    ` : ''}

                    <div class="footer">
                        <p>© 2026 CropDoc Pro · Advanced Agricultural AI</p>
                        <p style="font-size:0.8em;">This report is for informational purposes only. Consult a professional for critical decisions.</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.9);
            color: #fff;
            padding: 12px 24px;
            border-radius: 60px;
            font-size: 0.9rem;
            z-index: 1000;
            backdrop-filter: blur(10px);
            animation: slideUp 0.3s ease;
            border: 1px solid #6fbf6f;
        `;
        document.body.appendChild(toast);
        setTimeout(() => {
            toast.style.animation = 'slideDown 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 2500);
    }

    // Add styles for toast
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideUp {
            from { opacity: 0; transform: translateX(-50%) translateY(20px); }
            to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
        @keyframes slideDown {
            from { opacity: 1; transform: translateX(-50%) translateY(0); }
            to { opacity: 0; transform: translateX(-50%) translateY(20px); }
        }
        .root-results {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
            padding: 16px;
            background: var(--bg-dark);
            border-radius: 12px;
        }
        .root-metric {
            display: flex;
            flex-direction: column;
            padding: 8px;
            background: var(--bg-card);
            border-radius: 8px;
            border: 1px solid var(--border-color);
        }
        .root-metric span {
            font-size: 0.7rem;
            color: var(--text-muted);
            text-transform: uppercase;
        }
        .root-metric strong {
            font-size: 1.2rem;
            font-weight: 700;
        }
        .root-healthy { color: #4caf50; }
        .root-good { color: #8bc34a; }
        .root-moderate { color: #ff9800; }
        .root-poor { color: #f44336; }
        .root-recommendation {
            grid-column: 1 / -1;
            padding: 12px;
            background: var(--bg-card);
            border-radius: 8px;
            border-left: 4px solid #6fbf6f;
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .root-recommendation i {
            color: #6fbf6f;
            font-size: 1.2rem;
        }
    `;
    document.head.appendChild(style);

    // Expose Scanner API
    window.ScannerFull = {
        init: init,
        takeSnapshot: takeSnapshot,
        toggleRecording: toggleRecording,
        performRootScan: performRootScan,
        printReport: printReport,
        showToast: showToast
    };

})();
