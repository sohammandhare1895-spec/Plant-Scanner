// export-manager.js - Data export and import

(function() {
    'use strict';

    function exportData(format = 'json') {
        const data = {
            settings: localStorage.getItem('cropdoc_settings'),
            gallery: localStorage.getItem('cropdoc_gallery'),
            history: localStorage.getItem('cropdoc_history'),
            reports: localStorage.getItem('cropdoc_reports'),
            exportDate: new Date().toISOString(),
            version: '2.0.0'
        };

        switch (format) {
            case 'json':
                return exportJSON(data);
            case 'csv':
                return exportCSV(data);
            case 'html':
                return exportHTML(data);
            default:
                return exportJSON(data);
        }
    }

    function exportJSON(data) {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        downloadBlob(blob, `cropdoc_backup_${Date.now()}.json`);
        return true;
    }

    function exportCSV(data) {
        // Parse gallery data
        let gallery = [];
        try {
            gallery = JSON.parse(data.gallery || '[]');
        } catch (e) {}

        if (gallery.length === 0) {
            alert('No data to export as CSV');
            return false;
        }

        const headers = ['ID', 'Crop', 'Condition', 'Confidence', 'Timestamp'];
        const rows = gallery.map(item => [
            item.id || '',
            item.crop || '',
            item.condition || '',
            item.confidence || '',
            item.timestamp || ''
        ]);

        const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
        const blob = new Blob([csvContent], { type: 'text/csv' });
        downloadBlob(blob, `cropdoc_data_${Date.now()}.csv`);
        return true;
    }

    function exportHTML(data) {
        // Parse data
        let gallery = [];
        try {
            gallery = JSON.parse(data.gallery || '[]');
        } catch (e) {}

        const html = `
            <!DOCTYPE html>
            <html>
            <head>
                <title>CropDoc Export</title>
                <style>
                    body { font-family: Arial, sans-serif; padding: 20px; background: #f5f5f5; }
                    .container { max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 12px; }
                    h1 { color: #2d5a2d; }
                    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
                    th { background: #2d5a2d; color: white; padding: 10px; text-align: left; }
                    td { padding: 8px 10px; border-bottom: 1px solid #ddd; }
                    .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin: 20px 0; }
                    .stat-card { background: #f0f0f0; padding: 16px; border-radius: 8px; text-align: center; }
                    .stat-number { font-size: 24px; font-weight: bold; color: #2d5a2d; }
                    .stat-label { color: #666; }
                    .footer { margin-top: 20px; color: #888; text-align: center; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>🌾 CropDoc Pro Export</h1>
                    <p>Generated: ${new Date().toLocaleString()}</p>
                    <p>Version: ${data.version || '2.0.0'}</p>

                    <div class="stats">
                        <div class="stat-card">
                            <div class="stat-number">${gallery.length}</div>
                            <div class="stat-label">Total Images</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${gallery.filter(i => i.condition === 'Healthy').length}</div>
                            <div class="stat-label">Healthy Plants</div>
                        </div>
                        <div class="stat-card">
                            <div class="stat-number">${gallery.filter(i => i.condition !== 'Healthy' && i.condition !== 'Unknown').length}</div>
                            <div class="stat-label">Diseases Detected</div>
                        </div>
                    </div>

                    ${gallery.length > 0 ? `
                    <h2>Gallery Data</h2>
                    <table>
                        <thead>
                            <tr>
                                <th>#</th>
                                <th>Crop</th>
                                <th>Condition</th>
                                <th>Confidence</th>
                                <th>Date</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${gallery.map((item, i) => `
                                <tr>
                                    <td>${i + 1}</td>
                                    <td>${item.crop || 'Unknown'}</td>
                                    <td>${item.condition || 'Unknown'}</td>
                                    <td>${item.confidence || 0}%</td>
                                    <td>${new Date(item.timestamp).toLocaleDateString()}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    ` : '<p>No data available</p>'}

                    <div class="footer">
                        <p>© 2026 CropDoc Pro · Advanced Agricultural AI</p>
                    </div>
                </div>
            </body>
            </html>
        `;

        const blob = new Blob([html], { type: 'text/html' });
        downloadBlob(blob, `cropdoc_export_${Date.now()}.html`);
        return true;
    }

    function downloadBlob(blob, filename) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    function importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const data = JSON.parse(e.target.result);
                    if (data.gallery) localStorage.setItem('cropdoc_gallery', data.gallery);
                    if (data.history) localStorage.setItem('cropdoc_history', data.history);
                    if (data.reports) localStorage.setItem('cropdoc_reports', data.reports);
                    if (data.settings) localStorage.setItem('cropdoc_settings', data.settings);
                    resolve({ success: true, message: 'Data imported successfully' });
                } catch (err) {
                    reject({ success: false, error: 'Invalid file format' });
                }
            };
            reader.onerror = function() {
                reject({ success: false, error: 'Failed to read file' });
            };
            reader.readAsText(file);
        });
    }

    // Expose ExportManager
    window.ExportManager = {
        export: exportData,
        import: importData,
        exportJSON: () => exportData('json'),
        exportCSV: () => exportData('csv'),
        exportHTML: () => exportData('html')
    };

})();
