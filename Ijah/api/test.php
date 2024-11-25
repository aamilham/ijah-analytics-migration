<?php
header('Content-Type: application/json');

$response = array(
    'status' => 'ok',
    'message' => 'PHP server is running',
    'server_info' => array(
        'php_version' => PHP_VERSION,
        'current_dir' => __DIR__,
        'files_in_dir' => scandir(__DIR__)
    )
);

echo json_encode($response, JSON_PRETTY_PRINT);
?>
