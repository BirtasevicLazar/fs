<?php
require_once '../database/cors.php';
require_once '../database/db.php';
require_once '../utils/session.php';
require_once '../utils/security.php';

// Rate limiting za login
function checkRateLimit($ip) {
    global $conn;
    
    $time_window = 300; // 5 minuta
    $max_attempts = 5;  // 5 pokušaja
    $current_time = time();
    $cutoff_time = $current_time - $time_window;
    
    // Kreiraj tabelu ako ne postoji
    $conn->query("CREATE TABLE IF NOT EXISTS login_attempts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        ip_address VARCHAR(45) NOT NULL,
        attempt_time INT NOT NULL,
        INDEX idx_ip_time (ip_address, attempt_time)
    )");
    
    // Obriši stare pokušaje
    $stmt = $conn->prepare("DELETE FROM login_attempts WHERE attempt_time < ?");
    $stmt->bind_param("i", $cutoff_time);
    $stmt->execute();
    
    // Proveri broj pokušaja za ovaj IP
    $stmt = $conn->prepare("SELECT COUNT(*) as attempts FROM login_attempts WHERE ip_address = ? AND attempt_time > ?");
    $stmt->bind_param("si", $ip, $cutoff_time);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result->fetch_assoc();
    
    if ($row['attempts'] >= $max_attempts) {
        return false; // Previše pokušaja
    }
    
    return true; // OK
}

function logFailedAttempt($ip) {
    global $conn;
    
    $current_time = time();
    $stmt = $conn->prepare("INSERT INTO login_attempts (ip_address, attempt_time) VALUES (?, ?)");
    $stmt->bind_param("si", $ip, $current_time);
    $stmt->execute();
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nije dozvoljena']);
    exit;
}

// Proveri rate limit
$client_ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
if (!checkRateLimit($client_ip)) {
    http_response_code(429);
    echo json_encode(['error' => 'Previše pokušaja login-a. Pokušajte ponovo za 5 minuta.']);
    exit;
}

// Čitanje JSON podataka
requireJsonRequest();
$input = readJsonBody();

if (!isset($input['username']) || !isset($input['password'])) {
    http_response_code(400);
    echo json_encode(['error' => 'Username i password su obavezni']);
    exit;
}

$username = trim($input['username']);
$password = $input['password'];

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Username i password ne mogu biti prazni']);
    exit;
}

try {
    // Pronađi korisnika u bazi
    $stmt = $conn->prepare("SELECT id, username, password FROM users WHERE username = ?");
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();
    
    if ($result->num_rows === 0) {
        logFailedAttempt($client_ip);
        http_response_code(401);
        echo json_encode(['error' => 'Neispravni podaci za login']);
        exit;
    }
    
    $user = $result->fetch_assoc();
    
    // Proveri password (pretpostavljam da je hash-ovan)
    if (!password_verify($password, $user['password'])) {
        logFailedAttempt($client_ip);
        http_response_code(401);
        echo json_encode(['error' => 'Neispravni podaci za login']);
        exit;
    }
    
    // Login uspešan
    login($user['id'], $user['username']);
    
    echo json_encode([
        'success' => true,
        'message' => 'Uspešno ste se ulogovali',
        'user' => [
            'id' => $user['id'],
            'username' => $user['username']
        ]
    ]);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Greška na serveru: ' . $e->getMessage()]);
}

$conn->close();
?>