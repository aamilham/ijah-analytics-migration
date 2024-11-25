<?php
require_once 'cors_header.php';
header('Content-Type: application/json');

// Simple API status check
$response = array(
    'status' => 'ok',
    'message' => 'Ijah API is running',
    'endpoints' => array(
        'plants' => '/get_plants.php',
        'compounds' => '/get_compounds.php',
        'proteins' => '/get_proteins.php',
        'diseases' => '/get_diseases.php'
    )
);

echo json_encode($response);
?>
