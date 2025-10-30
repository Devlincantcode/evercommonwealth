<?php
include 'db_connect.php';

$sql = "SELECT * FROM content ORDER BY id DESC LIMIT 1";
$result = $conn->query($sql);

if ($result && $result->num_rows > 0) {
    echo json_encode($result->fetch_assoc());
} else {
    echo json_encode(["error" => "No content found."]);
}

$conn->close();
?>
