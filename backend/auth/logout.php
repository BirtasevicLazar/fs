<?php

require_once '../database/cors.php';
require_once '../utils/session.php';

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Metoda nije dozvoljena']);
    exit;
}

if (!isLoggedIn()) {
    http_response_code(400);
    echo json_encode(['error' => 'Niste ulogovani']);
    exit;
}

logout();

echo json_encode([
    'success' => true,
    'message' => 'Uspešno ste se izlogovali'
]);
?>