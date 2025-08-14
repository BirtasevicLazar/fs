<?php
// Sigurnosne session postavke
ini_set('session.cookie_httponly', 1);  // Sprečava XSS napade
ini_set('session.use_only_cookies', 1); // Samo cookies, ne URL
ini_set('session.cookie_secure', 0);    // Postaviti na 1 za HTTPS
ini_set('session.cookie_samesite', 'Strict'); // CSRF zaštita

if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

// Regeneriši session ID periodično (anti session hijacking)
if (!isset($_SESSION['last_regeneration'])) {
    $_SESSION['last_regeneration'] = time();
} elseif (time() - $_SESSION['last_regeneration'] > 7200) { // 2 sata
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);
        $_SESSION['last_regeneration'] = time();
    }
}

// Session timeout (4 sata umesto 2)
if (isset($_SESSION['last_activity']) && (time() - $_SESSION['last_activity'] > 14400)) {
    session_unset();
    session_destroy();
    if (session_status() === PHP_SESSION_NONE) {
        session_start(); // Pokreni novu sesiju
    }
}
$_SESSION['last_activity'] = time();


function isLoggedIn() {
    return isset($_SESSION['user_id']);
}

function requireLogin() {
    if (!isLoggedIn()) {
        http_response_code(401);
        echo json_encode(['error' => 'Nemate dozvolu za pristup. Morate biti ulogovani.']);
        exit;
    }
}

function login($user_id, $username) {
    // Pokreni sesiju ako nije pokrenuta
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    $_SESSION['user_id'] = $user_id;
    $_SESSION['username'] = $username;
    $_SESSION['last_activity'] = time();
    $_SESSION['last_regeneration'] = time();
    
    // Regeneriši session ID radi bezbednosti
    regenerateSession();
}

function logout() {
    // Pokreni sesiju ako nije pokrenuta
    if (session_status() === PHP_SESSION_NONE) {
        session_start();
    }
    
    // Obriši sve session varijable
    $_SESSION = array();
    
    // Obriši session cookie ako postoji
    if (ini_get("session.use_cookies")) {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
    
    // Uništi sesiju samo ako je aktivna
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_destroy();
    }
}

function getCurrentUser() {
    if (!isLoggedIn()) {
        return null;
    }
    
    return [
        'id' => $_SESSION['user_id'],
        'username' => $_SESSION['username']
    ];
}

function regenerateSession() {
    // Regeneriši session ID radi bezbednosti, ali samo ako je sesija aktivna
    if (session_status() === PHP_SESSION_ACTIVE) {
        session_regenerate_id(true);
    }
}
?>