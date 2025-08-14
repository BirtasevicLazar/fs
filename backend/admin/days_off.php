<?php
require_once __DIR__ . '/../database/cors.php';
require_once __DIR__ . '/../database/db.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/session.php';

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

if ($method === 'GET') {
    requireLogin();
    $res = $conn->query('SELECT id, date, reason FROM days_off ORDER BY date');
    $rows = [];
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    echo json_encode($rows);
    exit;
}

requireLogin();
requireJsonRequest();
$data = readJsonBody();

switch ($method) {
    case 'POST':
        $date = sanitizeInput($data['date'] ?? '', 'string');
        $reason = sanitizeInput($data['reason'] ?? '', 'string');
        if ($date === '') { http_response_code(400); echo json_encode(['error' => 'date je obavezan (YYYY-MM-DD)']); exit; }
        $stmt = $conn->prepare('INSERT INTO days_off (date, reason) VALUES (?, ?) ON DUPLICATE KEY UPDATE reason=VALUES(reason)');
        $stmt->bind_param('ss', $date, $reason);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        $id = sanitizeInput($data['id'] ?? null, 'int');
        if ($id === null) { http_response_code(400); echo json_encode(['error' => 'id obavezan']); exit; }
        $stmt = $conn->prepare('DELETE FROM days_off WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Metoda nije dozvoljena']);
}
