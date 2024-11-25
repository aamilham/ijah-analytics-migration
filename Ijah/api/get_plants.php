<?php
require_once 'cors_header.php';
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

require_once 'init.php';

try {
    // Get search term from query parameter
    $search = isset($_GET['search']) ? trim($_GET['search']) : '';
    
    // Base query
    $query = "SELECT pla_id as id, pla_name as name FROM plant";
    
    // Add search condition if search term is provided
    if (!empty($search)) {
        // Using ILIKE for case-insensitive search and adding wildcards for partial matches
        $search = pg_escape_string($link, $search);
        $query .= " WHERE pla_name ILIKE '%$search%'";
    }
    
    // Add ordering
    $query .= " ORDER BY pla_name";
    
    $result = pg_query($link, $query);
    
    if (!$result) {
        throw new Exception(pg_last_error($link));
    }
    
    $plants = array();
    while ($row = pg_fetch_assoc($result)) {
        $plants[] = $row;
    }
    
    echo json_encode($plants);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
