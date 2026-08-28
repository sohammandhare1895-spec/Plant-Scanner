// gallery.js - Gallery management

(function() {
    'use strict';

    let images = [];
    let currentView = 'grid';

    function init() {
        loadGallery();
        setupControls();
        setupFilters();
        renderGallery();
    }

    function loadGallery() {
        try {
            const saved = localStorage.getItem('cropdoc_gallery');
            if (saved) {
                images = JSON.parse(saved);
            }
        } catch (e) {
            console.warn('Failed to load gallery:', e);
        }
        updateStats();
    }

    function saveGallery() {
        try {
            localStorage.setItem('cropdoc_gallery', JSON.stringify(images));
        } catch (e) {
            console.warn('Failed to save gallery:', e);
        }
        updateStats();
    }

    function addImage(dataUrl, detection) {
        const entry = {
            id: Date.now(),
            type: 'image',
            data: dataUrl,
            crop: detection?.crop || 'Unknown',
            condition: detection?.condition || 'Unknown',
            confidence: detection?.confidence || 0,
            timestamp: new Date().toISOString(),
            symptoms: detection?.symptoms || []
        };
        images.unshift(entry);
        saveGallery();
        renderGallery();
        return entry;
    }

    function addVideo(url) {
        const entry = {
            id: Date.now(),
            type: 'video',
            data: url,
            crop: 'Unknown',
            condition: 'Recording',
            timestamp: new Date().toISOString()
        };
        images.unshift(entry);
        saveGallery();
        renderGallery();
        return entry;
    }

    function deleteImage(id) {
        images = images.filter(img => img.id !== id);
        saveGallery();
        renderGallery();
    }

    function deleteAll() {
        if (confirm('Delete all images?')) {
            images = [];
            saveGallery();
            renderGallery();
        }
    }

    function setupControls() {
        document.getElementById('gridView')?.addEventListener('click', () => {
            currentView = 'grid';
            renderGallery();
        });

        document.getElementById('listView')?.addEventListener('click', () => {
            currentView = 'list';
            renderGallery();
        });

        document.getElementById('deleteAll')?.addEventListener('click', deleteAll);

        document.getElementById('exportAll')?.addEventListener('click', exportAll);
    }

    function setupFilters() {
        const search = document.getElementById('searchGallery');
        const cropFilter = document.getElementById('filterCrop');
        const conditionFilter = document.getElementById('filterCondition');

        [search, cropFilter, conditionFilter].forEach(el => {
            if (el) {
                el.addEventListener('change', renderGallery);
                el.addEventListener('keyup', renderGallery);
            }
        });
    }

    function getFilteredImages() {
        const search = document.getElementById('searchGallery')?.value?.toLowerCase() || '';
        const cropFilter = document.getElementById('filterCrop')?.value || 'all';
        const conditionFilter = document.getElementById('filterCondition')?.value || 'all';

        return images.filter(img => {
            const matchSearch = !search || 
                img.crop?.toLowerCase().includes(search) || 
                img.condition?.toLowerCase().includes(search);
            const matchCrop = cropFilter === 'all' || img.crop?.toLowerCase() === cropFilter;
            const matchCondition = conditionFilter === 'all' || 
                (conditionFilter === 'healthy' && img.condition === 'Healthy') ||
                (conditionFilter === 'disease' && img.condition !== 'Healthy' && img.condition !== 'Unknown') ||
                (conditionFilter === 'deficiency' && img.condition.includes('Deficiency'));
            return matchSearch && matchCrop && matchCondition;
        });
    }

    function renderGallery() {
        const grid = document.getElementById('galleryGrid');
        if (!grid) return;

        const filtered = getFilteredImages();

        if (filtered.length === 0) {
            grid.innerHTML = `
                <div class="gallery-empty">
                    <i class="fas fa-camera fa-3x"></i>
                    <h3>No images found</h3>
                    <p>Start scanning or adjust your filters</p>
                    <a href="scanner.html" class="btn-primary">Take Photo</a>
                </div>
            `;
            updateStats();
            return;
        }

        if (currentView === 'grid') {
            grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
            grid.innerHTML = filtered.map(img => `
                <div class="gallery-item">
                    ${img.type === 'video' ? 
                        `<video src="${img.data}" muted></video>` :
                        `<img src="${img.data}" alt="${img.crop}" />`
                    }
                    <div class="gallery-item-info">
                        <h4>${img.crop}</h4>
                        <p>${img.condition} · ${img.confidence}%</p>
                    </div>
                    <span class="gallery-item-tag ${getTagClass(img.condition)}">${img.condition}</span>
                    <button class="delete-btn" data-id="${img.id}"><i class="fas fa-times"></i></button>
                </div>
            `).join('');
        } else {
            grid.style.gridTemplateColumns = '1fr';
            grid.innerHTML = filtered.map(img => `
                <div class="gallery-item list-item">
                    <div style="display:flex;align-items:center;gap:16px;padding:12px;">
                        <div style="width:60px;height:60px;border-radius:8px;overflow:hidden;flex-shrink:0;">
                            ${img.type === 'video' ? 
                                `<video src="${img.data}" muted style="width:100%;height:100%;object-fit:cover;"></video>` :
                                `<img src="${img.data}" style="width:100%;height:100%;object-fit:cover;" />`
                            }
                        </div>
                        <div style="flex:1;">
                            <h4>${img.crop}</h4>
                            <p>${img.condition} · ${new Date(img.timestamp).toLocaleDateString()}</p>
                        </div>
                        <button class="delete-btn" data-id="${img.id}"><i class="fas fa-trash"></i></button>
                    </div>
                </div>
            `).join('');
        }

        // Add delete handlers
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.stopPropagation();
                const id = parseInt(this.dataset.id);
                deleteImage(id);
            });
        });

        updateStats();
    }

    function getTagClass(condition) {
        if (condition === 'Healthy') return 'tag-healthy';
        if (condition.includes('Deficiency')) return 'tag-deficiency';
        return 'tag-disease';
    }

    function updateStats() {
        const count = document.getElementById('galleryCount');
        const size = document.getElementById('gallerySize');
        if (count) count.textContent = `${images.length} images`;
        if (size) {
            const totalSize = images.reduce((sum, img) => {
                if (img.data) {
                    // Approximate size from data URL
                    return sum + (img.data.length * 0.75) / 1024 / 1024;
                }
                return sum;
            }, 0);
            size.textContent = `${totalSize.toFixed(1)} MB`;
        }
    }

    function exportAll() {
        if (images.length === 0) {
            alert('No images to export');
            return;
        }

        // Create a zip-like export (just download as JSON for simplicity)
        const data = JSON.stringify(images, null, 2);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cropdoc_gallery_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);
    }

    // Expose Gallery API
    window.Gallery = {
        init: init,
        addImage: addImage,
        addVideo: addVideo,
        deleteImage: deleteImage,
        deleteAll: deleteAll,
        exportAll: exportAll,
        getImages: () => images,
        render: renderGallery
    };

})();
