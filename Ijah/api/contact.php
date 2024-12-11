<?php
// CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: http://localhost:4200");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Accept');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(204);
    exit();
}

header('Content-Type: application/json');

// Pastikan composer sudah dijalankan: composer require phpmailer/phpmailer
require_once __DIR__ . '/vendor/autoload.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Baca input JSON
$postData = file_get_contents('php://input');
if (!$postData) {
    http_response_code(400);
    echo json_encode(['error' => 'No input data received']);
    exit;
}

$data = json_decode($postData, true);
if ($data === null) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON']);
    exit;
}

// Baca config database IJAH
$dbConfigStr = file_get_contents(__DIR__ . "/config_database.json");
if ($dbConfigStr === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read database config']);
    exit;
}

$dbConfig = json_decode($dbConfigStr, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid database config']);
    exit;
}

// Baca config database Contact
$contactConfigStr = file_get_contents(__DIR__ . "/config_contact.json");
if ($contactConfigStr === false) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read contact database config']);
    exit;
}

$contactConfig = json_decode($contactConfigStr, true);
if (json_last_error() !== JSON_ERROR_NONE) {
    http_response_code(500);
    echo json_encode(['error' => 'Invalid contact database config']);
    exit;
}

// Koneksi ke PostgreSQL IJAH
$connStr = "host={$dbConfig['host']} dbname={$dbConfig['database']} user={$dbConfig['user']} password={$dbConfig['password']}";
$link = pg_connect($connStr);
if (!$link) {
    http_response_code(500);
    echo json_encode(['error' => 'IJAH Database connection failed']);
    exit;
}

// Koneksi ke PostgreSQL Contact
$contactConnStr = "host={$contactConfig['host']} dbname={$contactConfig['database']} user={$contactConfig['user']} password={$contactConfig['password']}";
$contactLink = pg_connect($contactConnStr);
if (!$contactLink) {
    http_response_code(500);
    echo json_encode(['error' => 'Contact Database connection failed']);
    exit;
}

// Validasi field
$required = ['name','email','subject','message'];
foreach ($required as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
        http_response_code(400);
        echo json_encode(['error' => "Field '$field' is required"]);
        exit;
    }
}

$name = pg_escape_string($link, $data['name']);
$email = pg_escape_string($link, $data['email']);
$aff = pg_escape_string($link, isset($data['affiliation'])?$data['affiliation']:'');
$sbj = pg_escape_string($link, $data['subject']);
$msg = pg_escape_string($link, $data['message']);

// Save to IJAH database
$query = "INSERT INTO messages (subject, name, email, affiliation, message) 
          VALUES ('$sbj', '$name', '$email', '$aff', '$msg') RETURNING id";

$result = pg_query($link, $query);
if (!$result) {
    http_response_code(500);
    echo json_encode(['error' => 'Failed to save message to IJAH database', 'details' => pg_last_error($link)]);
    exit;
}

$row = pg_fetch_assoc($result);
$messageId = $row['id'];

// Save to Contact database
$contactQuery = "INSERT INTO messages (subject, name, email, affiliation, message) 
                VALUES ('$sbj', '$name', '$email', '$aff', '$msg')";

$contactResult = pg_query($contactLink, $contactQuery);
if (!$contactResult) {
    $warning = 'Message saved to IJAH but failed to save to Contact database: ' . pg_last_error($contactLink);
} else {
    $warning = null;
}

// Read email config
$emailConfigStr = file_get_contents(__DIR__ . "/config_email.json");
if ($emailConfigStr === false) {
    $warning = 'Failed to read email config';
} else {
    $emailConfig = json_decode($emailConfigStr, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        $warning = 'Invalid email config';
    } else {
        try {
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = $emailConfig['smtp_host'];
            $mail->SMTPAuth = true;
            $mail->Username = $emailConfig['smtp_username'];
            $mail->Password = $emailConfig['smtp_password'];
            $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
            $mail->Port = $emailConfig['smtp_port'];

            $mail->setFrom($emailConfig['smtp_username'], $emailConfig['from_name']);
            $mail->addAddress($emailConfig['smtp_username']);
            $mail->addReplyTo($email, $name);

            $mail->isHTML(true);
            $mail->Subject = "New Contact (#$messageId): $sbj";
            $mail->Body = "
              <h2>New Contact Form Submission</h2>
              <p><strong>Message ID:</strong> #$messageId</p>
              <p><strong>From:</strong> $name</p>
              <p><strong>Email:</strong> $email</p>
              <p><strong>Affiliation:</strong> $aff</p>
              <p><strong>Subject:</strong> $sbj</p>
              <p><strong>Message:</strong></p>
              <p>$msg</p>
            ";

            $mail->send();
            $warning = null;
        } catch (Exception $e) {
            $warning = "Mail not sent: " . $mail->ErrorInfo;
        }
    }
}

echo json_encode(['ack' => 'OK', 'message_id' => $messageId, 'warning' => $warning]);
