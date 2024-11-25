<?php

  /* change list : aamilham
  1. change phpmailer path and version
  2. add sanitize input for preventing SQL injection
  3. simpler the query
  4. change mail to try catch syntax */
  
  error_reporting(E_ALL);
  ini_set('display_errors', 1);

  header('Access-Control-Allow-Origin: http://localhost:4200');
  header('Content-Type: application/json');
  header('Access-Control-Allow-Methods: POST, OPTIONS');
  header('Access-Control-Allow-Headers: Content-Type, X-Requested-With');
  header('Access-Control-Allow-Credentials: true');

  // Handle preflight OPTIONS request
  if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit();
  }

  require_once 'vendor/autoload.php';
  use PHPMailer\PHPMailer\PHPMailer;
  use PHPMailer\PHPMailer\Exception;

  // Get raw POST data
  $postData = file_get_contents('php://input');
  error_log("Received POST data: " . $postData);

  $data = json_decode($postData, true);

  if ($data === null) {
    http_response_code(400);
    echo json_encode(['error' => 'Invalid JSON data: ' . json_last_error_msg()]);
    exit();
  }

  // Read database configuration
  $dbConfigStr = file_get_contents(__DIR__ . "/config_contact.json");
  if ($dbConfigStr === false) {
    error_log("Failed to read config file");
    http_response_code(500);
    echo json_encode(['error' => 'Failed to read database configuration']);
    exit();
  }

  $dbConfig = json_decode($dbConfigStr, true);
  if (json_last_error() !== JSON_ERROR_NONE) {
    error_log("Failed to parse config JSON");
    http_response_code(500);
    echo json_encode(['error' => 'Invalid database configuration']);
    exit();
  }

  // Connect to database
  $link = pg_connect("host={$dbConfig['host']} dbname={$dbConfig['database']} user={$dbConfig['user']} password={$dbConfig['password']}");
  if (!$link) {
    error_log("Database connection failed");
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed']);
    exit;
  }

  // Validate required fields
  $required_fields = ['name', 'email', 'subject', 'message'];
  foreach ($required_fields as $field) {
    if (!isset($data[$field]) || empty(trim($data[$field]))) {
      http_response_code(400);
      echo json_encode(['ack' => 'ERROR', 'message' => "Field '$field' is required"]);
      exit;
    }
  }

  // Sanitize input
  $name = pg_escape_string($link, $data['name']);
  $email = pg_escape_string($link, $data['email']);
  $aff = pg_escape_string($link, isset($data['affiliation']) ? $data['affiliation'] : '');
  $sbj = pg_escape_string($link, $data['subject']);
  $msg = pg_escape_string($link, $data['message']);

  // Insert into database
  $query = "INSERT INTO messages (subject, name, email, affiliation, message) 
            VALUES ('$sbj', '$name', '$email', '$aff', '$msg') 
            RETURNING id";

  $result = pg_query($link, $query);
  if (!$result) {
    error_log('Query failed: ' . pg_last_error($link));
    http_response_code(500);
    echo json_encode(['ack' => 'ERROR', 'message' => 'Failed to save message']);
    exit;
  }

  $row = pg_fetch_assoc($result);
  $messageId = $row['id'];

  // Send email notification
  try {
    $mail = new PHPMailer(true);
    $mail->SMTPDebug = 0;
    $mail->isSMTP();
    $mail->Host = 'smtp.gmail.com';
    $mail->SMTPAuth = true;
    $mail->Username = 'ijahweb@gmail.com'; // Update with your email
    $mail->Password = 'your_password_here'; // Update with your password
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Port = 587;

    $mail->setFrom('ijahweb@gmail.com', 'IJAH Web');
    $mail->addAddress('ijahweb@gmail.com');
    $mail->addReplyTo($email, $name);

    $mail->isHTML(true);
    $mail->Subject = "New Contact Form Message (#$messageId): $sbj";
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
    echo json_encode(['ack' => 'OK', 'message_id' => $messageId]);
  } catch (Exception $e) {
    error_log("Message could not be sent. Mailer Error: {$mail->ErrorInfo}");
    // Still return OK since we saved to database
    echo json_encode(['ack' => 'OK', 'message_id' => $messageId]);
  }
?>
