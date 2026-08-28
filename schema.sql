-- schema.sql - Complete database schema

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    email VARCHAR(100),
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Detections table
CREATE TABLE IF NOT EXISTS detections (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    crop VARCHAR(50),
    condition_name VARCHAR(100),
    confidence DECIMAL(5,2),
    symptoms TEXT,
    treatment TEXT,
    image_path VARCHAR(255),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- NPK Analysis table
CREATE TABLE IF NOT EXISTS npk_analysis (
    id INT AUTO_INCREMENT PRIMARY KEY,
    detection_id INT,
    nitrogen DECIMAL(5,2),
    phosphorus DECIMAL(5,2),
    potassium DECIMAL(5,2),
    ratio VARCHAR(20),
    status VARCHAR(50),
    recommendation TEXT,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (detection_id) REFERENCES detections(id)
);

-- Reports table
CREATE TABLE IF NOT EXISTS reports (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT,
    type VARCHAR(50),
    data TEXT,
    filename VARCHAR(255),
    file_path VARCHAR(255),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- Weather data (for environmental context)
CREATE TABLE IF NOT EXISTS weather_data (
    id INT AUTO_INCREMENT PRIMARY KEY,
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    temperature DECIMAL(5,2),
    humidity DECIMAL(5,2),
    rainfall DECIMAL(5,2),
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Crop database
CREATE TABLE IF NOT EXISTS crops (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50),
    scientific_name VARCHAR(100),
    category VARCHAR(50),
    growing_season VARCHAR(50),
    optimal_npk VARCHAR(20)
);

-- Diseases database
CREATE TABLE IF NOT EXISTS diseases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100),
    crop_id INT,
    type VARCHAR(50),
    symptoms TEXT,
    treatment_chemical TEXT,
    treatment_organic TEXT,
    prevention TEXT,
    FOREIGN KEY (crop_id) REFERENCES crops(id)
);

-- Indexes
CREATE INDEX idx_detections_user ON detections(user_id);
CREATE INDEX idx_detections_timestamp ON detections(timestamp);
CREATE INDEX idx_npk_detection ON npk_analysis(detection_id);
CREATE INDEX idx_reports_user ON reports(user_id);
