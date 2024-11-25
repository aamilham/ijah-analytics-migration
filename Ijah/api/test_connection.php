<?php
header('Content-Type: application/json');
error_reporting(E_ALL);
ini_set('display_errors', 1);

try {
    // Read database config
    $dbConfigStr = file_get_contents(__DIR__ . "/config_database.json");
    if ($dbConfigStr === false) {
        throw new Exception('Failed to read database config');
    }

    $dbConfig = json_decode($dbConfigStr, true);
    
    // Connect to the backup database
    $conn = pg_connect("host={$dbConfig['host']} dbname=ijahdatabase_bak user={$dbConfig['user']} password={$dbConfig['password']}");
    if (!$conn) {
        throw new Exception('Could not connect to ijahdatabase_bak');
    }

    // Get list of tables
    $tables = ['compound', 'compound_vs_protein', 'disease', 'plant', 'plant_vs_compound', 'protein', 'protein_vs_disease', 'user_msg'];
    $tableStats = [];

    foreach ($tables as $table) {
        $countQuery = pg_query($conn, "SELECT COUNT(*) FROM $table");
        if ($countQuery) {
            $count = pg_fetch_result($countQuery, 0, 0);
            $tableStats[$table] = [
                'exists' => true,
                'row_count' => (int)$count
            ];
        } else {
            $tableStats[$table] = [
                'exists' => false,
                'error' => pg_last_error($conn)
            ];
        }
    }

    // Check if total_view exists
    $viewQuery = pg_query($conn, "SELECT * FROM total_view");
    if ($viewQuery) {
        $totals = pg_fetch_assoc($viewQuery);
        $tableStats['total_view'] = [
            'exists' => true,
            'data' => $totals
        ];
    } else {
        $tableStats['total_view'] = [
            'exists' => false,
            'error' => pg_last_error($conn)
        ];
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Database connection and structure verified',
        'database' => 'ijahdatabase_bak',
        'tables' => $tableStats
    ], JSON_PRETTY_PRINT);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
