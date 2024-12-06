<?php

/* change list : aamilham
 1. this file didnt update so much
 2. add env for mail and mail pass
 3. add error handling using json */

function exception_error_handler($errno, $errstr, $errfile, $errline) : void {
    throw new ErrorException($errstr, $errno, 0, $errfile, $errline);
}
set_error_handler("exception_error_handler");

// Allow from any origin
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');    // cache for 1 day
}

// Add CORS headers
header('Access-Control-Allow-Origin: http://localhost:4200');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

// Access-Control headers are received during OPTIONS requests
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");

    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");

    exit(0);
}

// feedback mail config
$ijahMail = getenv('IJAH_MAIL') ?: 'ijahweb@gmail.com';
$ijahMailPass = getenv('IJAH_MAIL_PASS') ?: 'jamujoss';

// database config  ///////////////////////////////////////////////////////////////
$dbConfigStr = file_get_contents(__DIR__ . "/config_database.json");
if ($dbConfigStr === false) {
    throw new Exception('Failed to read database config');
}

$dbConfig = json_decode($dbConfigStr, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    throw new Exception('Failed to parse database config: ' . json_last_error_msg());
}

// database connection /////////////////////////////////////////////////////////////
$connStr = "host={$dbConfig['host']} dbname={$dbConfig['database']} user={$dbConfig['user']} password={$dbConfig['password']}";
$link = pg_connect($connStr);
if (!$link) {
    throw new Exception('Failed to connect to database: ' . pg_last_error());
}

$predictorChannelHost = '127.0.0.1';

// Prediction-related config
$timeToWait = 10;
$predictorChannelPort = 5000;
?>
