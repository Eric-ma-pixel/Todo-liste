<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'GET') {
    if (!isset($_GET['id']) || empty($_GET['id'])) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "ID de tâche manquant"
        ]);
        exit();
    }
    
    $taskId = $_GET['id'];
    
    try {
        $conn = connectDB();
        
        $stmt = $conn->prepare("SELECT * FROM tasks WHERE id = :id");
        $stmt->bindParam(':id', $taskId);
        $stmt->execute();
        
        $task = $stmt->fetch(PDO::FETCH_ASSOC);
        
        if ($task) {
            echo json_encode($task);
        } else {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Tâche non trouvée"
            ]);
        }
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