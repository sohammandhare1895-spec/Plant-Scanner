<?php
// auth.php - Authentication system

class Auth {
    private $conn;
    private $secret_key = 'cropdoc_secret_key_2026';
    
    public function __construct($db) {
        $this->conn = $db;
        $this->initTable();
    }
    
    private function initTable() {
        $sql = "CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE,
            password VARCHAR(255),
            email VARCHAR(100),
            role VARCHAR(20) DEFAULT 'user',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )";
        $this->conn->exec($sql);
    }
    
    public function register($username, $password, $email) {
        $hashed = password_hash($password, PASSWORD_DEFAULT);
        $sql = "INSERT INTO users (username, password, email) VALUES (?, ?, ?)";
        $stmt = $this->conn->prepare($sql);
        try {
            $stmt->execute([$username, $hashed, $email]);
            return ['success' => true, 'id' => $this->conn->lastInsertId()];
        } catch (PDOException $e) {
            return ['success' => false, 'error' => 'Username already exists'];
        }
    }
    
    public function login($username, $password) {
        $sql = "SELECT * FROM users WHERE username = ?";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute([$username]);
        $user = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($user && password_verify($password, $user['password'])) {
            $token = $this->generateToken($user);
            return ['success' => true, 'token' => $token, 'user' => $user];
        }
        return ['success' => false, 'error' => 'Invalid credentials'];
    }
    
    private function generateToken($user) {
        $payload = [
            'id' => $user['id'],
            'username' => $user['username'],
            'role' => $user['role'],
            'exp' => time() + 86400 // 24 hours
        ];
        return base64_encode(json_encode($payload));
    }
    
    public function validateToken($token) {
        try {
            $payload = json_decode(base64_decode($token), true);
            if ($payload && $payload['exp'] > time()) {
                return $payload;
            }
        } catch (Exception $e) {}
        return false;
    }
}
?>
