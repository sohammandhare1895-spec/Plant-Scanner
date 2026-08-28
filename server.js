// server.js - Node.js backend server

const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// File upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const dir = './uploads';
        if (!fs.existsSync(dir)) fs.mkdirSync(dir);
        cb(null, dir);
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});
const upload = multer({ storage });

// Routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.post('/api/upload', upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    res.json({
        success: true,
        file: req.file.filename,
        path: req.file.path
    });
});

app.post('/api/detect', (req, res) => {
    // Simulate detection
    const image = req.body.image || '';
    const result = {
        crop: ['Tomato', 'Wheat', 'Maize', 'Rice', 'Potato'][Math.floor(Math.random() * 5)],
        condition: ['Early Blight', 'Leaf Rust', 'Nitrogen Deficiency', 'Bacterial Blight', 'Late Blight'][Math.floor(Math.random() * 5)],
        confidence: 75 + Math.random() * 20,
        timestamp: new Date().toISOString()
    };
    res.json(result);
});

app.post('/api/npk', (req, res) => {
    const result = {
        npk: {
            nitrogen: 30 + Math.random() * 50,
            phosphorus: 20 + Math.random() * 40,
            potassium: 30 + Math.random() * 50
        },
        ratio: '4-2-6',
        status: 'Optimal'
    };
    res.json(result);
});

app.get('/api/history', (req, res) => {
    const history = [];
    for (let i = 0; i < 20; i++) {
        history.push({
            id: i,
            crop: ['Tomato', 'Wheat', 'Maize', 'Rice', 'Potato'][Math.floor(Math.random() * 5)],
            condition: ['Early Blight', 'Leaf Rust', 'Nitrogen Deficiency', 'Bacterial Blight', 'Late Blight'][Math.floor(Math.random() * 5)],
            confidence: 70 + Math.random() * 25,
            timestamp: new Date(Date.now() - i * 3600000).toISOString()
        });
    }
    res.json(history);
});

app.post('/api/report', (req, res) => {
    const report = {
        id: Date.now(),
        type: req.body.type || 'weekly',
        filename: `report_${Date.now()}.pdf`,
        timestamp: new Date().toISOString()
    };
    res.json(report);
});

app.listen(port, () => {
    console.log(`🚀 CropDoc server running on port ${port}`);
});
