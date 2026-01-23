<?php
if (file_exists('config.php')) {
    http_response_code(403);
    exit('Forbidden: Application is already installed.');
}

if (!file_exists('ENABLE_INSTALL')) {
    http_response_code(403);
    exit('Forbidden: Please create a file named ENABLE_INSTALL in this directory to proceed.');
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $host = $_POST['host'] ?? '';
    $db = $_POST['db'] ?? '';
    $user = $_POST['user'] ?? '';
    $pass = $_POST['pass'] ?? '';

    $adminEmail = $_POST['admin_email'] ?? '';
    $adminPass = $_POST['admin_pass'] ?? '';

    try {
        $dsn = "mysql:host=$host;charset=utf8mb4";
        $pdo = new PDO($dsn, $user, $pass, [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);

        // Create DB if not exists
        $pdo->exec("CREATE DATABASE IF NOT EXISTS `$db` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
        $pdo->exec("USE `$db`");

        // Create Tables
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                email VARCHAR(255) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                is_admin TINYINT(1) DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_login TIMESTAMP NULL
            ) ENGINE=InnoDB;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS budget_configs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                config_id VARCHAR(36) NOT NULL,
                name VARCHAR(255) NOT NULL,
                content JSON NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_config (user_id, config_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        ");

        $pdo->exec("
            CREATE TABLE IF NOT EXISTS scenario_configs (
                id INT AUTO_INCREMENT PRIMARY KEY,
                user_id INT NOT NULL,
                config_id VARCHAR(36) NOT NULL,
                name VARCHAR(255) NOT NULL,
                content JSON NOT NULL,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                UNIQUE KEY unique_config (user_id, config_id),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            ) ENGINE=InnoDB;
        ");

        // Also create login_attempts here to be safe, although auth.php handles it too
        $pdo->exec("
            CREATE TABLE IF NOT EXISTS login_attempts (
                id INT AUTO_INCREMENT PRIMARY KEY,
                ip_address VARCHAR(45) NOT NULL,
                email VARCHAR(255),
                attempted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB;
        ");

        // Create Admin
        $hash = password_hash($adminPass, PASSWORD_DEFAULT);
        $stmt = $pdo->prepare("INSERT INTO users (email, password_hash, is_admin) VALUES (?, ?, 1)");
        $stmt->execute([$adminEmail, $hash]);

        // Write config file
        $configContent = "<?php\n";
        $configContent .= "define('DB_HOST', " . var_export($host, true) . ");\n";
        $configContent .= "define('DB_NAME', " . var_export($db, true) . ");\n";
        $configContent .= "define('DB_USER', " . var_export($user, true) . ");\n";
        $configContent .= "define('DB_PASS', " . var_export($pass, true) . ");\n";

        file_put_contents('config.php', $configContent);

        // Delete the installation marker
        @unlink('ENABLE_INSTALL');

        echo "<h1>Installation Successful!</h1><p>You can now delete install.php and start using the application.</p>";
        echo "<a href='/'>Go to App</a>";
        exit;

    } catch (PDOException $e) {
        $error = "Connection failed: " . $e->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="de">
<head>
    <meta charset="UTF-8">
    <title>Finanztool Installer</title>
    <style>
        body { font-family: sans-serif; max-width: 600px; margin: 2rem auto; padding: 0 1rem; }
        label { display: block; margin-top: 1rem; }
        input { width: 100%; padding: 0.5rem; margin-top: 0.25rem; }
        button { margin-top: 2rem; padding: 0.75rem 1.5rem; background: #3b82f6; color: white; border: none; cursor: pointer; font-size: 1rem; }
        .error { color: red; background: #fee2e2; padding: 1rem; border-radius: 4px; }
    </style>
</head>
<body>
    <h1>Finanztool Installer</h1>
    <?php if (isset($error)) echo "<div class='error'>$error</div>"; ?>
    <form method="post">
        <h2>Datenbank Verbindung</h2>
        <label>Host (z.B. localhost)
            <input name="host" required value="localhost">
        </label>
        <label>Datenbank Name
            <input name="db" required value="finanztool">
        </label>
        <label>Benutzer
            <input name="user" required>
        </label>
        <label>Passwort
            <input name="pass" type="password">
        </label>

        <h2>Admin Benutzer</h2>
        <label>Email
            <input name="admin_email" type="email" required>
        </label>
        <label>Passwort
            <input name="admin_pass" type="password" required minlength="8">
        </label>

        <button type="submit">Installieren</button>
    </form>
</body>
</html>
