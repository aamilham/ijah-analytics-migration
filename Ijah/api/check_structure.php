<?php
header('Content-Type: application/json');

$host = "localhost";
$dbname = "ijahdatabase";
$user = "postgres";
$password = "Freedom255";

$connStr = "host=$host dbname=$dbname user=$user password=$password";
$conn = pg_connect($connStr);

$query = "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'plant'";
$result = pg_query($conn, $query);

$columns = [];
while ($row = pg_fetch_assoc($result)) {
    $columns[] = $row;
}

echo json_encode($columns, JSON_PRETTY_PRINT);
