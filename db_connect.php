<?php
// db_connect.php - Database connection and operations

class Database {
    private $conn;
    
    public function __construct() {
        $this->connect();
    }
    
    private function connect() {
        $host = 'localhost';
        $dbname = 'cropdoc';
        $username = 'root';
        $password = '';
        
        try {
            $this->conn = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
            $this->conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
            $this->initTables();
        } catch(PDOException $e) {
            echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
            exit;
        }
    }
    
    private function initTables() {
        $queries = [
            "CREATE TABLE IF NOT EXISTS detections (
                id INT AUTO_INCREMENT PRIMARY KEY,
                crop VARCHAR(50),
                condition_name VARCHAR(100),
                confidence FLOAT,
                symptoms TEXT,
                treatment TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS npk_analysis (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nitrogen FLOAT,
                phosphorus FLOAT,
                potassium FLOAT,
                ratio VARCHAR(20),
                status VARCHAR(50),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )",
            "CREATE TABLE IF NOT EXISTS reports (
                id INT AUTO_INCREMENT PRIMARY KEY,
                type VARCHAR(50),
                data TEXT,
                filename VARCHAR(255),
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
            )"
        ];
        
        foreach ($queries as $query) {
            $this->conn->exec($query);
        }
    }
    
    public function saveDetection($data) {
        $sql = "INSERT INTO detections (crop, condition_name, confidence, symptoms, treatment) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            $data['crop'] ?? 'Unknown',
            $data['condition'] ?? 'Unknown',
            $data['confidence'] ?? 0,
            json_encode($data['symptoms'] ?? []),
            json_encode($data['treatment'] ?? [])
        ]);
        return $this->conn->lastInsertId();
    }
    
    public function saveNPK($data) {
        $sql = "INSERT INTO npk_analysis (nitrogen, phosphorus, potassium, ratio, status) 
                VALUES (?, ?, ?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $npk = $data['npk'] ?? [];
        $stmt->execute([
            $npk['nitrogen'] ?? 0,
            $npk['phosphorus'] ?? 0,
            $npk['potassium'] ?? 0,
            $data['ratio'] ?? '0-0-0',
            $data['status'] ?? 'Unknown'
        ]);
        return $this->conn->lastInsertId();
    }
    
    public function getDetections($limit = 50) {
        $sql = "SELECT * FROM detections ORDER BY timestamp DESC LIMIT ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getNPKHistory($limit = 20) {
        $sql = "SELECT * FROM npk_analysis ORDER BY timestamp DESC LIMIT ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$limit]);
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getReports() {
        $sql = "SELECT * FROM reports ORDER BY timestamp DESC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }
    
    public function getMetrics() {
        $sql = "SELECT 
                COUNT(*) as total_scans,
                SUM(CASE WHEN condition_name = 'Healthy' THEN 1 ELSE 0 END) as healthy_count,
                SUM(CASE WHEN condition_name != 'Healthy' THEN 1 ELSE 0 END) as disease_count
                FROM detections";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }
    
    public function saveReport($data) {
        $sql = "INSERT INTO reports (type, data, filename) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([
            $data['type'] ?? 'custom',
            json_encode($data['data'] ?? []),
            $data['filename'] ?? ''
        ]);
        return $this->conn->lastInsertId();
    }
    
    public function deleteDetection($id) {
        $sql = "DELETE FROM detections WHERE id = ?";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([$id]);
    }
    
    public function clearAll() {
        $this->conn->exec("DELETE FROM detections");
        $this->conn->exec("DELETE FROM npk_analysis");
        $this->conn->exec("DELETE FROM reports");
        return true;
    }
}
?>
