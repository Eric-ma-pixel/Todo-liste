<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    try {
        $conn = connectDB();
        
        $stmt = $conn->prepare("SELECT * FROM tasks ORDER BY date ASC");
        $stmt->execute();
        
        $tasks = $stmt->fetchAll(PDO::FETCH_ASSOC);
        
        echo json_encode($tasks);
    } catch(PDOException $e) {
        http_response_code(500);
        echo json_encode([
            "status" => "error",
            "message" => "Erreur: " . $e->getMessage()
        ]);
    }
    
    $conn = null;
} else {
    http_response_code(405);
    echo json_encode([
        "status" => "error",
        "message" => "Méthode non autorisée. Utilisez GET."
    ]);
}
?>