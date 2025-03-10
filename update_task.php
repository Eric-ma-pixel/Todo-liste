<?php
require_once 'config.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Récupérer le contenu JSON
    $data = json_decode(file_get_contents("php://input"));
    
    // Vérifier les données requises
    if (!isset($data->id) || empty($data->id) || !isset($data->title) || empty($data->title) || !isset($data->date) || empty($data->date)) {
        http_response_code(400);
        echo json_encode([
            "status" => "error",
            "message" => "Données incomplètes. ID, titre et date sont requis."
        ]);
        exit();
    }
    
    try {
        $conn = connectDB();
        
        $stmt = $conn->prepare("UPDATE tasks SET title = :title, description = :description, date = :date WHERE id = :id");
        
        // Description peut être optionnelle
        $description = isset($data->description) ? $data->description : '';
        
        $stmt->bindParam(':id', $data->id);
        $stmt->bindParam(':title', $data->title);
        $stmt->bindParam(':description', $description);
        $stmt->bindParam(':date', $data->date);
        
        $stmt->execute();
        
        if ($stmt->rowCount() > 0) {
            echo json_encode([
                "status" => "success",
                "message" => "Tâche mise à jour avec succès"
            ]);
        } else {
            http_response_code(404);
            echo json_encode([
                "status" => "error",
                "message" => "Tâche non trouvée ou aucune modification"
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