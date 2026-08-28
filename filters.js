// filters.js - Advanced image filters

(function() {
    'use strict';

    const filters = {
        normal: function(imageData) {
            return imageData;
        },

        grayscale: function(imageData) {
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const gray = 0.299 * data[i] + 0.587 * data[i+1] + 0.114 * data[i+2];
                data[i] = gray;
                data[i+1] = gray;
                data[i+2] = gray;
            }
            return imageData;
        },

        sepia: function(imageData) {
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const r = data[i], g = data[i+1], b = data[i+2];
                data[i] = Math.min(255, r * 0.393 + g * 0.769 + b * 0.189);
                data[i+1] = Math.min(255, r * 0.349 + g * 0.686 + b * 0.168);
                data[i+2] = Math.min(255, r * 0.272 + g * 0.534 + b * 0.131);
            }
            return imageData;
        },

        invert: function(imageData) {
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = 255 - data[i];
                data[i+1] = 255 - data[i+1];
                data[i+2] = 255 - data[i+2];
            }
            return imageData;
        },

        blur: function(imageData, radius = 2) {
            // Simple box blur
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            const output = new Uint8ClampedArray(data);

            for (let y = 0; y < height; y++) {
                for (let x = 0; x < width; x++) {
                    let r = 0, g = 0, b = 0, count = 0;
                    for (let dy = -radius; dy <= radius; dy++) {
                        for (let dx = -radius; dx <= radius; dx++) {
                            const nx = Math.min(width - 1, Math.max(0, x + dx));
                            const ny = Math.min(height - 1, Math.max(0, y + dy));
                            const idx = (ny * width + nx) * 4;
                            r += data[idx];
                            g += data[idx + 1];
                            b += data[idx + 2];
                            count++;
                        }
                    }
                    const idx = (y * width + x) * 4;
                    output[idx] = r / count;
                    output[idx + 1] = g / count;
                    output[idx + 2] = b / count;
                    output[idx + 3] = data[idx + 3];
                }
            }

            return new ImageData(output, width, height);
        },

        sharpen: function(imageData) {
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            const output = new Uint8ClampedArray(data);

            const kernel = [
                [0, -1, 0],
                [-1, 5, -1],
                [0, -1, 0]
            ];

            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    let r = 0, g = 0, b = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const idx = ((y + dy) * width + (x + dx)) * 4;
                            const k = kernel[dy + 1][dx + 1];
                            r += data[idx] * k;
                            g += data[idx + 1] * k;
                            b += data[idx + 2] * k;
                        }
                    }
                    const idx = (y * width + x) * 4;
                    output[idx] = Math.min(255, Math.max(0, r));
                    output[idx + 1] = Math.min(255, Math.max(0, g));
                    output[idx + 2] = Math.min(255, Math.max(0, b));
                    output[idx + 3] = data[idx + 3];
                }
            }

            return new ImageData(output, width, height);
        },

        edge: function(imageData) {
            const data = imageData.data;
            const width = imageData.width;
            const height = imageData.height;
            const output = new Uint8ClampedArray(data);

            const kernelX = [
                [-1, 0, 1],
                [-2, 0, 2],
                [-1, 0, 1]
            ];
            const kernelY = [
                [-1, -2, -1],
                [0, 0, 0],
                [1, 2, 1]
            ];

            for (let y = 1; y < height - 1; y++) {
                for (let x = 1; x < width - 1; x++) {
                    let gx = 0, gy = 0;
                    for (let dy = -1; dy <= 1; dy++) {
                        for (let dx = -1; dx <= 1; dx++) {
                            const idx = ((y + dy) * width + (x + dx)) * 4;
                            const gray = 0.299 * data[idx] + 0.587 * data[idx+1] + 0.114 * data[idx+2];
                            gx += gray * kernelX[dy + 1][dx + 1];
                            gy += gray * kernelY[dy + 1][dx + 1];
                        }
                    }
                    const magnitude = Math.min(255, Math.sqrt(gx*gx + gy*gy));
                    const idx = (y * width + x) * 4;
                    output[idx] = magnitude;
                    output[idx + 1] = magnitude;
                    output[idx + 2] = magnitude;
                    output[idx + 3] = data[idx + 3];
                }
            }

            return new ImageData(output, width, height);
        },

        heatmap: function(imageData) {
            // Simulate heatmap effect
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                const intensity = (data[i] + data[i+1] + data[i+2]) / 3;
                data[i] = Math.min(255, intensity * 1.5);
                data[i+1] = Math.min(255, intensity * 0.8);
                data[i+2] = Math.min(255, intensity * 0.3);
            }
            return imageData;
        }
    };

    function applyFilter(imageData, filterName) {
        const filter = filters[filterName];
        if (!filter) return imageData;
        return filter(imageData);
    }

    function applyFilterToCanvas(canvas, filterName) {
        const ctx = canvas.getContext('2d');
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const filtered = applyFilter(imageData, filterName);
        ctx.putImageData(filtered, 0, 0);
    }

    function applyFilterToImage(image, filterName, callback) {
        const canvas = document.createElement('canvas');
        canvas.width = image.width;
        canvas.height = image.height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0);
        applyFilterToCanvas(canvas, filterName);
        callback(canvas);
    }

    // Expose Filters API
    window.Filters = {
        apply: applyFilter,
        applyToCanvas: applyFilterToCanvas,
        applyToImage: applyFilterToImage,
        getFilters: () => Object.keys(filters)
    };

})();
