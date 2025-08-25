<?php
require_once __DIR__ . '/../database/cors.php';
require_once __DIR__ . '/../database/db.php';
require_once __DIR__ . '/../utils/security.php';
require_once __DIR__ . '/../utils/session.php';

// Admin-only CRUD for services

$method = $_SERVER['REQUEST_METHOD'] ?? 'GET';

// Admin-only listing for this endpoint; public listing exists under public/services.php
if ($method === 'GET') {
    requireLogin();
    // Admin can see all services by default. Optional filter: ?active=1 or ?active=0
    $rows = [];
    if (isset($_GET['active'])) {
        $active = (int)$_GET['active'];
        if ($active === 0 || $active === 1) {
            $res = $conn->query("SELECT id, name, price, duration_minutes, active FROM services WHERE active = $active ORDER BY name");
        } else {
            $res = $conn->query("SELECT id, name, price, duration_minutes, active FROM services ORDER BY name");
        }
    } else {
        $res = $conn->query("SELECT id, name, price, duration_minutes, active FROM services ORDER BY name");
    }
    while ($row = $res->fetch_assoc()) $rows[] = $row;
    echo json_encode($rows);
    exit;
}

// Require session auth for mutations
requireLogin();

if (in_array($method, ['POST','PUT','PATCH','DELETE'], true)) {
    requireJsonRequest();
    $data = readJsonBody();
}

switch ($method) {
    case 'POST':
        $name = sanitizeInput($data['name'] ?? '', 'string');
        $price = sanitizeInput($data['price'] ?? null, 'float');
        $duration = sanitizeInput($data['duration_minutes'] ?? null, 'int');
        if ($name === '' || $price === null || $duration === null) {
            http_response_code(400);
            echo json_encode(['error' => 'name, price, duration_minutes su obavezni']);
            exit;
        }
        $stmt = $conn->prepare("INSERT INTO services (name, price, duration_minutes, active) VALUES (?, ?, ?, 1)");
        $stmt->bind_param('sdi', $name, $price, $duration);
        $stmt->execute();
        echo json_encode(['success' => true, 'id' => $stmt->insert_id]);
        break;
    case 'PUT':
    case 'PATCH':
        $id = sanitizeInput($data['id'] ?? null, 'int');
        if ($id === null) { http_response_code(400); echo json_encode(['error' => 'id je obavezan']); exit; }

        // Build dynamic update
        $fields = [];
        $params = [];
        $types = '';
        if (isset($data['name'])) { $fields[] = 'name = ?'; $params[] = sanitizeInput($data['name'],'string'); $types .= 's'; }
        if (isset($data['price'])) { $fields[] = 'price = ?'; $params[] = sanitizeInput($data['price'],'float'); $types .= 'd'; }
        if (isset($data['duration_minutes'])) { $fields[] = 'duration_minutes = ?'; $params[] = sanitizeInput($data['duration_minutes'],'int'); $types .= 'i'; }
        if (isset($data['active'])) { $fields[] = 'active = ?'; $params[] = (int)sanitizeInput($data['active'],'int'); $types .= 'i'; }
        if (!$fields) { echo json_encode(['success'=>true, 'message'=>'nema promena']); break; }

        $sql = 'UPDATE services SET ' . implode(', ', $fields) . ' WHERE id = ?';
        $params[] = $id; $types .= 'i';
        $stmt = $conn->prepare($sql);
        $stmt->bind_param($types, ...$params);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    case 'DELETE':
        $id = sanitizeInput($data['id'] ?? null, 'int');
        if ($id === null) { http_response_code(400); echo json_encode(['error' => 'id je obavezan']); exit; }
        $stmt = $conn->prepare('DELETE FROM services WHERE id = ?');
        $stmt->bind_param('i', $id);
        $stmt->execute();
        echo json_encode(['success' => true]);
        break;
    default:
        http_response_code(405);
        echo json_encode(['error' => 'Metoda nije dozvoljena']);
}
