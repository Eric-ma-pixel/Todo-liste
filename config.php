<?php
// Paramètres de connexion à la base de données
$servername = "localhost";
$username = "root";  // Nom d'utilisateur par défaut pour XAMPP
$password = "";      // Mot de passe par défaut pour XAMPP
$dbname = "todo_db"; // Nom de la base de données

// Fonction pour créer une connexion PDO
function connectDB() {
    global $servername, $username, $password, $dbname;
    
    try {
        $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
        $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
        return $conn;
    } catch(PDOException $e) {
        die(json_encode([
            "status" => "error",
            "message" => "Erreur de connexion: " . $e->getMessage()
        ]));
    }
}

// Paramètres CORS pour autoriser les requêtes depuis n'importe quelle origine
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE");
header("Access-Control-Max-Age: 3600");
header("Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With");

// Gérer les requêtes OPTIONS (pré-vol)
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    http_response_code(200);
    exit();
}
?>