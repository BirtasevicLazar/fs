<?php

// Sigurnosni helper za input sanitization
function sanitizeInput($input, $type = 'string') {
    if ($input === null) {
        return null;
    }
    if (is_array($input)) {
        return array_map(function ($v) use ($type) {
            return sanitizeInput($v, $type);
        }, $input);
    }

    switch ($type) {
        case 'string':
            return htmlspecialchars(trim((string)$input), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
        case 'int':
            return filter_var($input, FILTER_VALIDATE_INT, FILTER_NULL_ON_FAILURE);
        case 'float':
            return filter_var($input, FILTER_VALIDATE_FLOAT, FILTER_NULL_ON_FAILURE);
        case 'bool':
            return filter_var($input, FILTER_VALIDATE_BOOLEAN, FILTER_NULL_ON_FAILURE);
        case 'email':
            return filter_var(trim((string)$input), FILTER_VALIDATE_EMAIL) ?: null;
        case 'url':
            return filter_var(trim((string)$input), FILTER_VALIDATE_URL) ?: null;
        case 'filename':
            // Ukloni opasne karaktere iz imena fajla
            $safe = preg_replace('/[^a-zA-Z0-9._-]/', '', (string)$input);
            return substr($safe, 0, 255);
        default:
            return htmlspecialchars(trim((string)$input), ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
    }
}

// Helper: strogo JSON zahtevi
function requireJsonRequest() {
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (stripos((string)$contentType, 'application/json') === false) {
        http_response_code(415);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Očekivan Content-Type: application/json']);
        exit;
    }
}

function readJsonBody(): array {
    $raw = file_get_contents('php://input');
    $data = json_decode($raw ?: '', true);
    if (json_last_error() !== JSON_ERROR_NONE || !is_array($data)) {
        http_response_code(400);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Nevažeći JSON payload']);
        exit;
    }
    return $data;
}

// Rate limiting helper (opšta funkcija)
function checkGeneralRateLimit($action, $ip, $max_attempts = 10, $time_window = 300) {
    if (!isset($GLOBALS['conn'])) return true; // ako nema baze, pusti dalje
    $conn = $GLOBALS['conn'];

    $current_time = time();
    $cutoff_time = $current_time - $time_window;

    // Tabela za opšti rate limiting
    $conn->query("CREATE TABLE IF NOT EXISTS rate_limits (
        id INT AUTO_INCREMENT PRIMARY KEY,
        action_type VARCHAR(50) NOT NULL,
        ip_address VARCHAR(45) NOT NULL,
        attempt_time INT NOT NULL,
        INDEX idx_action_ip_time (action_type, ip_address, attempt_time)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4");

    // Cleanup starih pokušaja
    $stmt = $conn->prepare("DELETE FROM rate_limits WHERE attempt_time < ?");
    $stmt->bind_param("i", $cutoff_time);
    $stmt->execute();

    // Proveri broj pokušaja
    $stmt = $conn->prepare("SELECT COUNT(*) as attempts FROM rate_limits WHERE action_type = ? AND ip_address = ? AND attempt_time > ?");
    $stmt->bind_param("ssi", $action, $ip, $cutoff_time);
    $stmt->execute();
    $result = $stmt->get_result();
    $row = $result ? $result->fetch_assoc() : ['attempts' => 0];

    if ((int)($row['attempts'] ?? 0) >= $max_attempts) {
        return false;
    }

    // Logiraj pokušaj
    $stmt = $conn->prepare("INSERT INTO rate_limits (action_type, ip_address, attempt_time) VALUES (?, ?, ?)");
    $stmt->bind_param("ssi", $action, $ip, $current_time);
    $stmt->execute();

    return true;
}

// SQL injection dodatna zaštita (heuristika + logging)
function logSQLInjectionAttempt($input, $ip) {
    if (!is_string($input) || $input === '') return false;
    $dangerous_patterns = [
        '/(?<![a-z])union\s+select(?![a-z])/i',
        '/(?<![a-z])drop\s+table(?![a-z])/i',
        '/(?<![a-z])insert\s+into(?![a-z])/i',
        '/(?<![a-z])delete\s+from(?![a-z])/i',
        '/(?<![a-z])update\s+.*\s+set(?![a-z])/i',
        '/<\s*script/i',
        '/javascript:/i'
    ];

    foreach ($dangerous_patterns as $pattern) {
        if (preg_match($pattern, $input)) {
            error_log("SECURITY: Possible SQL injection attempt from IP: $ip, Input: " . substr($input, 0, 200));
            return true;
        }
    }

    return false;
}

// Bezbedno dobijanje IP adrese (bez oslanjanja na X-Forwarded-For osim ako koristite proxy)
function getClientIp(): string {
    return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
}

?>
