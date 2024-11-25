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
    
    // Base query with COALESCE to handle multiple ID fields
    $query = "SELECT com_id as id, 
              COALESCE(com_drugbank_id, com_knapsack_id, com_kegg_id, com_pubchem_id, com_cas_id) as name 
              FROM compound";
    
    // Add search condition if search term is provided
    if (!empty($search)) {
        // Using ILIKE for case-insensitive search and adding wildcards for partial matches
        $search = pg_escape_string($link, $search);
        $query .= " WHERE 
                   com_drugbank_id ILIKE '%$search%' OR 
                   com_knapsack_id ILIKE '%$search%' OR 
                   com_kegg_id ILIKE '%$search%' OR 
                   com_pubchem_id ILIKE '%$search%' OR 
                   com_cas_id ILIKE '%$search%'";
    }
    
    // Add ordering by the COALESCE result
    $query .= " ORDER BY name";
    
    $result = pg_query($link, $query);
    
    if (!$result) {
        throw new Exception(pg_last_error($link));
    }
    
    $compounds = array();
    while ($row = pg_fetch_assoc($result)) {
        $compounds[] = $row;
    }
    
    echo json_encode($compounds);
    
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => $e->getMessage()]);
}
