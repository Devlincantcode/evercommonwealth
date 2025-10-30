<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

$servername = "sqlXXX.infinityfree.com";
$username = "epiz_12345678";            
$password = "everpeak32345";              
$dbname = "epiz_12345678_everpeak_db";   


$conn = new mysqli($servername, $username, $password, $dbname);
if ($conn->connect_error) {
    die(json_encode(["status" => "error", "message" => $conn->connect_error]));
}

$input = file_get_contents("php://input");
$data = json_decode($input, true);

if (!$data) {
    echo json_encode(["status" => "error", "message" => "No data received"]);
    exit;
}
$title = $conn->real_escape_string($data['title'] ?? '');
$price = $conn->real_escape_string($data['price'] ?? '');
$tagline = $conn->real_escape_string($data['tagline'] ?? '');
$location = $conn->real_escape_string($data['location'] ?? '');
$amenitiesLeft = $conn->real_escape_string($data['amenitiesLeft'] ?? '');
$amenitiesRight = $conn->real_escape_string($data['amenitiesRight'] ?? '');
$accessLeft = $conn->real_escape_string($data['accessLeft'] ?? '');
$accessRight = $conn->real_escape_string($data['accessRight'] ?? '');
$transportation = $conn->real_escape_string($data['transportation'] ?? '');
$footerTitle = $conn->real_escape_string($data['footerTitle'] ?? '');
$footerDescription = $conn->real_escape_string($data['footerDescription'] ?? '');
$facebookUrl = $conn->real_escape_string($data['facebookUrl'] ?? '');
$copyright = $conn->real_escape_string($data['copyright'] ?? '');
$carouselImages = $conn->real_escape_string($data['carouselImages'] ?? '');
$galleryImages = $conn->real_escape_string($data['galleryImages'] ?? '');

$sql = "UPDATE content SET 
    title='$title',
    price='$price',
    tagline='$tagline',
    location='$location',
    amenitiesLeft='$amenitiesLeft',
    amenitiesRight='$amenitiesRight',
    accessLeft='$accessLeft',
    accessRight='$accessRight',
    transportation='$transportation',
    footerTitle='$footerTitle',
    footerDescription='$footerDescription',
    facebookUrl='$facebookUrl',
    copyright='$copyright',
    carouselImages='$carouselImages',
    galleryImages='$galleryImages',
    last_updated=NOW()
    WHERE id=1";

if ($conn->query($sql) === TRUE) {
    echo json_encode(["status" => "success"]);
} else {
    echo json_encode(["status" => "error", "message" => $conn->error]);
}

$conn->close();
?>
