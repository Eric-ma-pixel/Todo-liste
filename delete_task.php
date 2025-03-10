<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer le contenu JSON
    $data = json_decode(file_get_contents("php://input"));
    
    // Vérifier l'ID
    if (!isset($data->id) || empty($data->id)) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "ID de tâche manquant"
        ]);
        exit();
    }
    
    try {
        $conn = connectDB();
        
        $stmt = $conn->prepare("DELETE FROM tasks WHERE id = :id");
        $stmt->bindParam(':id', $data->id);
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                "status" => "success",
                "message" => "Tâche supprimée avec succès"
            ]);
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
        "message" => "Méthode non autorisée. Utilisez POST."
    ]);
}
?>