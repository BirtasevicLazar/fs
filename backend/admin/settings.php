<?php
require_once __DIR__ . '/../database/cors.php';
require_once __DIR__ . '/../database/db.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/session.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    requireLogin();
    $res = $conn->query("SELECT `key`, `value` FROM settings");
    $out = [];
    while ($row = $res->fetch_assoc()) { $out[$row['key']] = $row['value']; }
    echo json_encode($out);
    exit;
}

requireLogin();
requireJsonRequest();
$data = readJsonBody();

switch ($method) {
    case 'POST':
    case 'PUT':
    case 'PATCH':
        // Only allow slot_interval_minutes for now
        if (!isset($data['slot_interval_minutes'])) {
            http_response_code(400);
            echo json_encode(['error' => 'slot_interval_minutes je obavezan']);
            exit;
        }
        $interval = sanitizeInput($data['slot_interval_minutes'], 'int');
        if ($interval === null || !in_array($interval, [15,30,45,60,90,120], true)) {
            http_response_code(400);
            echo json_encode(['error' => 'Dozvoljeni intervali: 15, 30, 45, 60, 90, 120 minuta']);
            exit;
        }
        $stmt = $conn->prepare("INSERT INTO settings (`key`, `value`) VALUES ('slot_interval_minutes', ?) ON DUPLICATE KEY UPDATE value=VALUES(value)");
        $val = (string)$interval;
        $stmt->bind_param('s', $val);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Metoda nije dozvoljena']);
}
