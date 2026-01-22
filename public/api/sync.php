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
    // Sync data (Overwrite strategy for now, or per-item update)
    // To implement "Update what changed", we can use the IDs.
    $input = getJsonInput();

    try {
        $pdo->beginTransaction();

        // Save Budget Configs
        if (isset($input['budgetConfigs'])) {
            $stmtUpsert = $pdo->prepare("
                INSERT INTO budget_configs (user_id, config_id, name, content, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name), content = VALUES(content), updated_at = VALUES(updated_at)
            ");

            // Also delete ones not in the list?
            // If the frontend sends ALL configs, we should delete those missing from DB.
            // Let's assume frontend sends ALL.

            $incomingIds = [];
            foreach ($input['budgetConfigs'] as $config) {
                $incomingIds[] = $config['id'];
                $stmtUpsert->execute([
                    $userId,
                    $config['id'],
                    $config['name'],
                    json_encode($config),
                    $config['updatedAt']
                ]);
            }

            if (!empty($incomingIds)) {
                $placeholders = str_repeat('?,', count($incomingIds) - 1) . '?';
                $stmtDelete = $pdo->prepare("DELETE FROM budget_configs WHERE user_id = ? AND config_id NOT IN ($placeholders)");
                $stmtDelete->execute(array_merge([$userId], $incomingIds));
            } else {
                // If empty list sent, delete all? Be careful.
                // If frontend sends empty list, it means user deleted everything.
                 $stmtDelete = $pdo->prepare("DELETE FROM budget_configs WHERE user_id = ?");
                 $stmtDelete->execute([$userId]);
            }
        }

        // Save Scenario Configs (Rent vs Own)
        if (isset($input['scenarioConfigs'])) {
            $stmtUpsert = $pdo->prepare("
                INSERT INTO scenario_configs (user_id, config_id, name, content, updated_at)
                VALUES (?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name), content = VALUES(content), updated_at = VALUES(updated_at)
            ");

            $incomingIds = [];
            foreach ($input['scenarioConfigs'] as $config) {
                $incomingIds[] = $config['id'];
                $stmtUpsert->execute([
                    $userId,
                    $config['id'],
                    $config['name'],
                    json_encode($config),
                    $config['updatedAt']
                ]);
            }

            if (!empty($incomingIds)) {
                $placeholders = str_repeat('?,', count($incomingIds) - 1) . '?';
                $stmtDelete = $pdo->prepare("DELETE FROM scenario_configs WHERE user_id = ? AND config_id NOT IN ($placeholders)");
                $stmtDelete->execute(array_merge([$userId], $incomingIds));
            } else {
                 $stmtDelete = $pdo->prepare("DELETE FROM scenario_configs WHERE user_id = ?");
                 $stmtDelete->execute([$userId]);
            }
        }

        $pdo->commit();
        jsonResponse(['success' => true]);

    } catch (Exception $e) {
        $pdo->rollBack();
        jsonResponse(['error' => $e->getMessage()], 500);
    }
}
