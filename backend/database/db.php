<?php
// Učitaj environment varijable iz .env fajla (ne prekidaj ako ne postoji)
function loadEnv($path) {
    if (!file_exists($path)) {
        return; // tiho preskoči
    }

    $lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    foreach ($lines as $line) {
        $line = trim($line);
        if ($line === '' || $line[0] === '#') continue; // komentar ili prazno

        $parts = explode('=', $line, 2);
        if (count($parts) !== 2) continue;

        list($name, $value) = $parts;
        $name = trim($name);
        $value = trim($value);
        if ($name === '') continue;

        if (!array_key_exists($name, $_ENV)) {
            $_ENV[$name] = $value;
        }
    }
}

// Učitaj .env fajl
loadEnv(__DIR__ . '/.env');

// Database konfiguracija iz environment varijabli
$host = $_ENV['DB_HOST'] ?? '127.0.0.1';
$dbname = $_ENV['DB_NAME'] ?? '';
$username = $_ENV['DB_USERNAME'] ?? 'root';
$password = $_ENV['DB_PASSWORD'] ?? '';

// Uključi izuzetke za mysqli radi lakšeg hendlovanja grešaka
mysqli_report(MYSQLI_REPORT_ERROR | MYSQLI_REPORT_STRICT);

try {
    $conn = new mysqli($host, $username, $password, $dbname);
    // Podesi najbezbedniji skup karaktera
    $conn->set_charset('utf8mb4');
} catch (mysqli_sql_exception $e) {
    $debug = ($_ENV['APP_DEBUG'] ?? 'false') === 'true';
    if ($debug) {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Greška pri konekciji', 'details' => $e->getMessage()]);
    } else {
        http_response_code(500);
        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['error' => 'Greška pri konekciji sa bazom podataka']);
    }
    exit;
}
?>