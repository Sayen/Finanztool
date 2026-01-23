<?php
session_start();
require_once 'db.php';

$pdo = getDB();
if (!$pdo) {
    jsonResponse(['error' => 'Database not configured'], 503);
}

if (!isset($_SESSION['user_id'])) {
    jsonResponse(['error' => 'Unauthorized'], 401);
}

$userId = $_SESSION['user_id'];
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Fetch all data
    $budgetConfigs = [];
    $stmt = $pdo->prepare("SELECT content FROM budget_configs WHERE user_id = ?");
    $stmt->execute([$userId]);
    while ($row = $stmt->fetch()) {
        $budgetConfigs[] = json_decode($row['content'], true);
    }

    $scenarioConfigs = [];
    $stmt = $pdo->prepare("SELECT content FROM scenario_configs WHERE user_id = ?");
    $stmt->execute([$userId]);
    while ($row = $stmt->fetch()) {
        $scenarioConfigs[] = json_decode($row['content'], true);
    }

    jsonResponse([
        'budgetConfigs' => $budgetConfigs,
        'scenarioConfigs' => $scenarioConfigs
    ]);

} elseif ($method === 'POST') {
    // Verify CSRF Token
    verifyCsrfToken();

    $input = getJsonInput();

    try {
        $pdo->beginTransaction();

        // 1. Budget Configs: Safe Union Merge
        // Only update if incoming is newer. Do NOT delete missing items to prevent data loss.
        if (isset($input['budgetConfigs']) && is_array($input['budgetConfigs'])) {
            // Pre-fetch timestamps of existing items to compare
            $stmtExist = $pdo->prepare("SELECT config_id, updated_at FROM budget_configs WHERE user_id = ?");
            $stmtExist->execute([$userId]);
            $existing = [];
            while ($row = $stmtExist->fetch()) {
                $existing[$row['config_id']] = $row['updated_at'];
            }

            $stmtUpsert = $pdo->prepare("
                INSERT INTO budget_configs (user_id, config_id, name, content, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name), content = VALUES(content), updated_at = VALUES(updated_at)
            ");

            foreach ($input['budgetConfigs'] as $config) {
                if (!isset($config['id']) || !isset($config['updatedAt'])) continue;

                $clientTime = strtotime($config['updatedAt']);
                if ($clientTime === false) continue;

                $mysqlTime = date('Y-m-d H:i:s', $clientTime);

                $shouldUpdate = true;
                if (isset($existing[$config['id']])) {
                    $serverTime = strtotime($existing[$config['id']]);
                    // Only update if client time is strictly greater
                    if ($clientTime <= $serverTime) {
                        $shouldUpdate = false;
                    }
                }

                if ($shouldUpdate) {
                    $stmtUpsert->execute([
                        $userId,
                        $config['id'],
                        $config['name'],
                        json_encode($config),
                        $mysqlTime
                    ]);
                }
            }
        }

        // 2. Scenario Configs: Safe Union Merge
        if (isset($input['scenarioConfigs']) && is_array($input['scenarioConfigs'])) {
             $stmtExist = $pdo->prepare("SELECT config_id, updated_at FROM scenario_configs WHERE user_id = ?");
            $stmtExist->execute([$userId]);
            $existing = [];
            while ($row = $stmtExist->fetch()) {
                $existing[$row['config_id']] = $row['updated_at'];
            }

            $stmtUpsert = $pdo->prepare("
                INSERT INTO scenario_configs (user_id, config_id, name, content, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name), content = VALUES(content), updated_at = VALUES(updated_at)
            ");

            foreach ($input['scenarioConfigs'] as $config) {
                if (!isset($config['id']) || !isset($config['updatedAt'])) continue;

                $clientTime = strtotime($config['updatedAt']);
                if ($clientTime === false) continue;

                $mysqlTime = date('Y-m-d H:i:s', $clientTime);

                $shouldUpdate = true;
                if (isset($existing[$config['id']])) {
                    $serverTime = strtotime($existing[$config['id']]);
                    if ($clientTime <= $serverTime) {
                        $shouldUpdate = false;
                    }
                }

                if ($shouldUpdate) {
                    $stmtUpsert->execute([
                        $userId,
                        $config['id'],
                        $config['name'],
                        json_encode($config),
                        $mysqlTime
                    ]);
                }
            }
        }

        $pdo->commit();
        jsonResponse(['success' => true]);

    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}
