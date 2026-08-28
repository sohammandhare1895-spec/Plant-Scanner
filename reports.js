// reports.js - Report generation and management

(function() {
    'use strict';

    let reports = [];

    function init() {
        loadReports();
        setupTemplates();
        setupGenerate();
        renderReports();
    }

    function loadReports() {
        try {
            const saved = localStorage.getItem('cropdoc_reports');
            if (saved) {
                reports = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load reports:', e);
        }
    }

    function saveReports() {
        try {
            localStorage.setItem('cropdoc_reports', JSON.stringify(reports));
        } catch (e) {
            console.warn('Failed to save reports:', e);
        }
    }

    function setupTemplates() {
        document.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', function() {
                const template = this.dataset.template;
                generateReport(template);
            });
        });
    }

    function setupGenerate() {
        document.getElementById('generateReportBtn')?.addEventListener('click', function() {
            generateReport('custom');
        });
    }

    function generateReport(type) {
        const diagnosis = window.AI ? window.AI.getDiagnosis() : null;
        const metrics = window.DataManager ? window.DataManager.getMetrics() : null;

        const report = {
            id: Date.now(),
            type: type,
            title: getReportTitle(type),
            date: new Date().toISOString(),
            diagnosis: diagnosis,
            metrics: metrics,
            pages: Math.floor(Math.random() * 5) + 3
        };

        reports.unshift(report);
        saveReports();
        renderReports();

        // Show success
        alert(`✅ ${report.title} generated successfully!`);
    }

    function getReportTitle(type) {
        const titles = {
            'daily': 'Daily Health Summary',
            'weekly': 'Weekly Health Report',
            'monthly': 'Monthly Crop Analysis',
            'custom': 'Custom Report'
        };
        return titles[type] || 'Crop Health Report';
    }

    function deleteReport(id) {
        if (confirm('Delete this report?')) {
            reports = reports.filter(r => r.id !== id);
            saveReports();
            renderReports();
        }
    }

    function downloadReport(id) {
        const report = reports.find(r => r.id === id);
        if (!report) return;

        const content = generateReportContent(report);
        const blob = new Blob([content], { type: 'application/pdf' });
        // For demo, download as text file
        const url = URL.createObjectURL(new Blob([content], { type: 'text/plain' }));
        const a = document.createElement('a');
        a.href = url;
        a.download = `${report.title.replace(/\s+/g, '_')}.txt`;
        a.click();
        URL.revokeObjectURL(url);
    }

    function generateReportContent(report) {
        const d = report.diagnosis || {};
        const m = report.metrics || {};
        return `
            =========================================
            🌾 CROPDOC PRO - HEALTH REPORT
            =========================================

            Title: ${report.title}
            Date: ${new Date(report.date).toLocaleString()}
            Type: ${report.type}

            -----------------------------------------
            DIAGNOSIS SUMMARY
            -----------------------------------------
            Crop: ${d.crop || 'N/A'}
            Condition: ${d.condition || 'N/A'}
            Confidence: ${d.confidence || 0}%
            Symptoms: ${(d.symptoms || []).join(', ') || 'N/A'}
            Cause: ${d.cause || 'N/A'}

            -----------------------------------------
            TREATMENT RECOMMENDATIONS
            -----------------------------------------
            Fertilizer: ${d.fertilizer || 'N/A'}
            Organic: ${d.organic || 'N/A'}
            Dosage: ${d.dosage || 'N/A'}

            -----------------------------------------
            METRICS
            -----------------------------------------
            Total Scans: ${m.totalScans || 0}
            Healthy Plants: ${m.healthyCount || 0}
            Diseases Detected: ${m.diseaseCount || 0}
            Common Disease: ${m.commonDisease || 'None'}

            -----------------------------------------
            REPORT END
            =========================================
        `;
    }

    function shareReport(id) {
        const report = reports.find(r => r.id === id);
        if (!report) return;

        // Use Web Share API if available
        if (navigator.share) {
            navigator.share({
                title: report.title,
                text: `CropDoc Report: ${report.title}`,
                url: window.location.href
            }).catch(() => {});
        } else {
            // Fallback: copy to clipboard
            const content = generateReportContent(report);
            navigator.clipboard.writeText(content).then(() => {
                alert('📋 Report content copied to clipboard!');
            }).catch(() => {
                alert('📋 Copy failed. Please select and copy manually.');
            });
        }
    }

    function renderReports() {
        const container = document.getElementById('reportList');
        if (!container) return;

        if (reports.length === 0) {
            container.innerHTML = `
                <div style="text-align:center;padding:40px;color:var(--text-muted);">
                    <i class="fas fa-file-pdf" style="font-size:3rem;color:var(--border-color);"></i>
                    <h3 style="margin-top:12px;">No reports yet</h3>
                    <p>Generate your first report using the templates above.</p>
                </div>
            `;
            return;
        }

        container.innerHTML = reports.map(report => `
            <div class="report-item">
                <div class="report-icon"><i class="fas fa-file-pdf"></i></div>
                <div class="report-info">
                    <h4>${report.title}</h4>
                    <p>Generated: ${new Date(report.date).toLocaleString()} · ${report.pages} pages</p>
                </div>
                <div class="report-actions">
                    <button class="btn-download" data-id="${report.id}"><i class="fas fa-download"></i></button>
                    <button class="btn-share" data-id="${report.id}"><i class="fas fa-share-alt"></i></button>
                    <button class="btn-delete" data-id="${report.id}"><i class="fas fa-trash"></i></button>
                </div>
            </div>
        `).join('');

        // Add event listeners
        container.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', () => downloadReport(parseInt(btn.dataset.id)));
        });
        container.querySelectorAll('.btn-share').forEach(btn => {
            btn.addEventListener('click', () => shareReport(parseInt(btn.dataset.id)));
        });
        container.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', () => deleteReport(parseInt(btn.dataset.id)));
        });
    }

    // Expose Reports API
    window.Reports = {
        init: init,
        generate: generateReport,
        delete: deleteReport,
        download: downloadReport,
        share: shareReport
    };

})();
