<?php
// Include CORS headers
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

header('Content-Type: application/json');

try {
    // Get search term from query parameter
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    // Base query
    $query = "SELECT dis_id as id, dis_omim_id, dis_name, CONCAT(dis_omim_id, ' | ', dis_name) as name FROM disease";
    
    // Add search condition if search term is provided
    if (!empty($search)) {
        // Using ILIKE for case-insensitive search and adding wildcards for partial matches
        $search = pg_escape_string($link, $search);
        $query .= " WHERE dis_name ILIKE '%$search%' OR dis_omim_id ILIKE '%$search%'";
    }

    // Using dis_name as the name field
    $result = pg_query($conn, "SELECT dis_name AS name FROM disease WHERE dis_name IS NOT NULL ORDER BY dis_name");
    if (!$result) {
        throw new Exception('Query failed: ' . pg_last_error($conn));
    }

    $data = [];
    while ($row = pg_fetch_assoc($result)) {
        if (!empty($row['name'])) {
            $data[] = $row;
        }
    }

    echo json_encode($data);
    pg_close($conn);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
