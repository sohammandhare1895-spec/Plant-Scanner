-- seed.sql - Sample data

-- Insert crops
INSERT INTO crops (name, scientific_name, category, growing_season, optimal_npk) VALUES
('Tomato', 'Solanum lycopersicum', 'Vegetable', 'Spring-Summer', '4-2-6'),
('Wheat', 'Triticum aestivum', 'Cereal', 'Winter', '6-3-4'),
('Maize', 'Zea mays', 'Cereal', 'Summer', '5-3-4'),
('Rice', 'Oryza sativa', 'Cereal', 'Monsoon', '4-2-5'),
('Potato', 'Solanum tuberosum', 'Vegetable', 'Spring', '5-4-6'),
('Soybean', 'Glycine max', 'Pulse', 'Summer', '3-4-5');

-- Insert diseases
INSERT INTO diseases (name, crop_id, type, symptoms, treatment_chemical, treatment_organic) VALUES
('Early Blight', 1, 'Fungal', 'Dark concentric rings, yellow halos', 'Copper-based fungicide', 'Neem oil + baking soda'),
('Leaf Rust', 2, 'Fungal', 'Orange/red pustules, chlorotic spots', 'Propiconazole spray', 'Sulfur dust + compost tea'),
('Nitrogen Deficiency', 3, 'Nutrient', 'V-shaped yellowing, stunted growth', 'Urea (46-0-0)', 'Compost manure + blood meal'),
('Bacterial Blight', 4, 'Bacterial', 'Water-soaked lesions, yellowish edges', 'Streptomycin sulfate', 'Copper oxychloride + garlic'),
('Late Blight', 5, 'Fungal', 'Dark green/black lesions, white growth', 'Mancozeb fungicide', 'Copper sulfate + lime'),
('Soybean Rust', 6, 'Fungal', 'Tiny brown spots, yellowing leaves', 'Triazole fungicide', 'Sulfur + neem extract');

-- Insert sample user
INSERT INTO users (username, password, email, role) VALUES
('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin@cropdoc.com', 'admin');

-- Insert sample detections
INSERT INTO detections (user_id, crop, condition_name, confidence, symptoms, timestamp) VALUES
(1, 'Tomato', 'Early Blight', 84.5, '["Dark concentric rings", "Yellow halos"]', DATE_SUB(NOW(), INTERVAL 2 HOUR)),
(1, 'Wheat', 'Leaf Rust', 88.2, '["Orange/red pustules", "Chlorotic spots"]', DATE_SUB(NOW(), INTERVAL 5 HOUR)),
(1, 'Maize', 'Nitrogen Deficiency', 79.0, '["V-shaped yellowing", "Stunted growth"]', DATE_SUB(NOW(), INTERVAL 1 DAY));
