<?php
// PHP skript za generisanje hash-a za password
// Pokreni ovaj fajl u browseru ili kroz terminal

if (isset($_GET['password'])) {
    $password = $_GET['password'];
    $hash = password_hash($password, PASSWORD_DEFAULT);
    
    echo "<h3>Password Hash Generator</h3>";
    echo "<p><strong>Password:</strong> " . htmlspecialchars($password) . "</p>";
    echo "<p><strong>Hash:</strong> " . $hash . "</p>";
    echo "<p><strong>SQL Query:</strong></p>";
    echo "<code>INSERT INTO users (username, password) VALUES ('admin', '$hash');</code>";
} else {
    echo "<h3>Password Hash Generator</h3>";
    echo "<form method='GET'>";
    echo "<label>Unesi password: </label>";
    echo "<input type='text' name='password' required>";
    echo "<input type='submit' value='Generiši Hash'>";
    echo "</form>";
}
?>
