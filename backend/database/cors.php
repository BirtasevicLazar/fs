<?php
header('Content-Type: application/json; charset=utf-8');

// CORS konfiguracija
$allowed_origins = [
    'http://localhost:8888',
    'http://localhost:3000',
    'http://localhost',
    'http://localhost:5173',
    'http://192.168.1.5:5173'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin && in_array($origin, $allowed_origins, true)) {
    header("Access-Control-Allow-Origin: $origin");
    header("Vary: Origin");
}

header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, X-CSRF-Token');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Max-Age: 600');

// Osnovni sigurnosni header-i
header('X-Content-Type-Options: nosniff');
header('X-Frame-Options: SAMEORIGIN');
header('X-XSS-Protection: 0'); // moderne browser-e koriste CSP
header("Referrer-Policy: no-referrer");
// Minimalni CSP; prilagoditi po potrebi frontendu
header("Content-Security-Policy: default-src 'self'; img-src 'self' data: blob:; style-src 'self' 'unsafe-inline'; script-src 'self'; connect-src 'self' http://localhost:3000 http://localhost:5173 http://localhost:8888 http://192.168.1.5:5173");

// Handle preflight OPTIONS request
if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'OPTIONS') {
    http_response_code(204);
    exit();
}

?>