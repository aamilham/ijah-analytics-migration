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
    
    // Connect to postgres database to create new database
    $conn = pg_connect("host={$dbConfig['host']} dbname=postgres user={$dbConfig['user']} password={$dbConfig['password']}");
    if (!$conn) {
        throw new Exception('Could not connect to PostgreSQL server');
    }

    // Check if database exists and drop it
    $result = pg_query($conn, "SELECT 1 FROM pg_database WHERE datname = 'ijahdatabase_bak'");
    $exists = pg_num_rows($result) > 0;

    if ($exists) {
        // Terminate all connections to the database
        $result = pg_query($conn, "SELECT pg_terminate_backend(pid) FROM pg_stat_activity WHERE datname = 'ijahdatabase_bak'");
        // Drop the database
        $result = pg_query($conn, 'DROP DATABASE ijahdatabase_bak');
        if (!$result) {
            throw new Exception('Failed to drop database: ' . pg_last_error($conn));
        }
        echo json_encode(['status' => 'success', 'message' => 'Existing database dropped successfully']);
    }

    // Create fresh database
    $result = pg_query($conn, 'CREATE DATABASE ijahdatabase_bak');
    if (!$result) {
        throw new Exception('Failed to create database: ' . pg_last_error($conn));
    }
    echo json_encode(['status' => 'success', 'message' => 'Fresh database created successfully']);

    pg_close($conn);

    // Now restore the database from SQL file
    $sqlFile = __DIR__ . '/ijahdatabase_bak.sql';
    if (!file_exists($sqlFile)) {
        throw new Exception('SQL backup file not found');
    }

    // Use pg_restore for the SQL file
    $command = sprintf(
        'pg_restore -h %s -U %s -d ijahdatabase_bak -v -c "%s" 2>&1',
        $dbConfig['host'],
        $dbConfig['user'],
        $sqlFile
    );

    // Set PGPASSWORD environment variable
    putenv("PGPASSWORD={$dbConfig['password']}");
    
    // Execute the restore command
    exec($command, $output, $return_var);

    if ($return_var !== 0) {
        throw new Exception('Error restoring database: ' . implode("\n", $output));
    }

    echo json_encode([
        'status' => 'success',
        'message' => 'Database restored successfully',
        'details' => $output
    ]);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'status' => 'error',
        'message' => $e->getMessage()
    ]);
}
?>
