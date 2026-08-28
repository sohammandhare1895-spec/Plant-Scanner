// scanner.js - Scanner page specific logic

(function() {
    'use strict';

    let isRecording = false;
    let mediaRecorder = null;
    let recordedChunks = [];

    function init() {
        setupButtons();
        setupFilters();
        setupNPK();
    }

    function setupButtons() {
        const photoBtn = document.getElementById('photoBtn');
        const videoBtn = document.getElementById('videoBtn');
        const filterBtn = document.getElementById('filterBtn');
        const printBtn = document.getElementById('printReportBtn');

        if (photoBtn) {
            photoBtn.addEventListener('click', function() {
                takeSnapshot();
            });
        }

        if (videoBtn) {
            videoBtn.addEventListener('click', function() {
                toggleRecording();
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
        if (activeFilter) {
            applyFilterToCanvas(canvas, activeFilter.dataset.filter);
        }

        // Save to gallery
        const dataUrl = canvas.toDataURL('image/png');
        if (window.Gallery) {
            const detection = window.AI ? window.AI.getDiagnosis() : null;
            window.Gallery.addImage(dataUrl, detection);
        }

        // Show feedback
        window.Camera.setFeedback('📸 Photo captured!');

        // Vibrate feedback
        if (navigator.vibrate) navigator.vibrate(50);
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
        if (!stream) return;

        recordedChunks = [];
        mediaRecorder = new MediaRecorder(stream);
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
            window.Camera.setFeedback('🎬 Video saved!');
        };

        mediaRecorder.start();
        isRecording = true;

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
                this.classList.toggle('active');
                applyFilterToVideo(this.dataset.filter);
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
            'heatmap': 'hue-rotate(30deg) saturate(300%)'
        };

        video.style.filter = filters[filter] || 'none';
    }

    function applyFilterToCanvas(canvas, filter) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;

        // Simple filter implementations
        switch(filter) {
            case 'grayscale':
                for (let i = 0; i < data.length; i += 4) {
                    const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
                    data[i] = gray;
                    data[i+1] = gray;
                    data[i+2] = gray;
                }
                break;
            case 'sepia':
                for (let i = 0; i < data.length; i += 4) {
                    const r = data[i], g = data[i+1], b = data[i+2];
                    data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                    data[i+1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                    data[i+2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
                }
                break;
            case 'invert':
                for (let i = 0; i < data.length; i += 4) {
                    data[i] = 255 - data[i];
                    data[i+1] = 255 - data[i+1];
                    data[i+2] = 255 - data[i+2];
                }
                break;
            default:
                break;
        }

        ctx.putImageData(imageData, 0, 0);
    }

    function setupNPK() {
        // NPK values will be updated by AI engine
        // Simulate NPK updates
        setInterval(() => {
            if (window.NPKAnalyzer) {
                window.NPKAnalyzer.update();
            }
        }, 3000);
    }

    function printReport() {
        const diagnosis = window.AI ? window.AI.getDiagnosis() : null;
        if (!diagnosis) {
            alert('No diagnosis data to print');
            return;
        }

        const printWindow = window.open('', '_blank', 'width=800,height=600');
        if (!printWindow) {
            alert('Please allow popups to print');
            return;
        }

        const content = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>CropDoc Report</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 40px; }
                    h1 { color: #2d5a2d; }
                    .header { border-bottom: 2px solid #2d5a2d; padding-bottom: 20px; }
                    .section { margin: 20px 0; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
                    .label { font-weight: bold; color: #555; }
                    .value { margin-left: 10px; }
                    .footer { margin-top: 40px; color: #888; font-size: 0.9em; text-align: center; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>🌾 CropDoc Pro - Plant Health Report</h1>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                </div>
                <div class="section">
                    <h2>Diagnosis Summary</h2>
                    <p><span class="label">Crop:</span><span class="value">${diagnosis.crop || 'Unknown'}</span></p>
                    <p><span class="label">Condition:</span><span class="value">${diagnosis.condition || 'Unknown'}</span></p>
                    <p><span class="label">Confidence:</span><span class="value">${diagnosis.confidence || 0}%</span></p>
                </div>
                <div class="section">
                    <h2>Treatment Recommendations</h2>
                    <p><span class="label">Primary Cause:</span><span class="value">${diagnosis.cause || '—'}</span></p>
                    <p><span class="label">Recommended Fertilizer:</span><span class="value">${diagnosis.fertilizer || '—'}</span></p>
                    <p><span class="label">Organic Treatment:</span><span class="value">${diagnosis.organic || '—'}</span></p>
                    <p><span class="label">Dosage:</span><span class="value">${diagnosis.dosage || '—'}</span></p>
                </div>
                <div class="section">
                    <h2>NPK Analysis</h2>
                    <p><span class="label">Nitrogen (N):</span><span class="value">${document.getElementById('nValue')?.textContent || '—'}</span></p>
                    <p><span class="label">Phosphorus (P):</span><span class="value">${document.getElementById('pValue')?.textContent || '—'}</span></p>
                    <p><span class="label">Potassium (K):</span><span class="value">${document.getElementById('kValue')?.textContent || '—'}</span></p>
                </div>
                <div class="footer">
                    <p>© 2026 CropDoc Pro · Advanced Agricultural AI</p>
                    <p>This report is for informational purposes only.</p>
                </div>
            </body>
            </html>
        `;

        printWindow.document.write(content);
        printWindow.document.close();
        setTimeout(() => { printWindow.print(); }, 500);
    }

    // Expose Scanner API
    window.Scanner = {
        init: init,
        takeSnapshot: takeSnapshot,
        toggleRecording: toggleRecording,
        printReport: printReport
    };

})();
