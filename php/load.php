<?php

// Transformations-Skript als 'transform.php' einbinden
$jsonData = include('transform.php');

// Dekodiert die JSON-Daten zu einem Array
$dataArray = json_decode($jsonData, true);

require_once 'config.php'; // Bindet die Datenbankkonfiguration ein

try {
    // Erstellt eine neue PDO-Instanz mit der Konfiguration aus config.php
    $pdo = new PDO($dsn, $username, $password, $options);

    // SQL-Query mit Platzhaltern für das Einfügen von Daten
    $sql = "INSERT INTO parking_status (name, free_spaces, total_spaces, published, longitude, latitude) VALUES (?, ?, ?, ?, ?, ?)";

    // Bereitet die SQL-Anweisung vor
    $stmt = $pdo->prepare($sql);

    // Fügt jedes Element im Array in die Datenbank ein
    foreach ($dataArray as $item) {
        // Stellt sicher, dass die Datumsformatierung korrekt ist
        $publishedDate = date('Y-m-d H:i:s', strtotime($item['published']));

        // // Fügt Geo-Punkte hinzu
        // $longitude = $item['geo_point_2d']['lon'];
        // $latitude = $item['geo_point_2d']['lat'];
        
        $stmt->execute([
            $item['name'],
            $item['free_spaces'],
            $item['total_spaces'],
            $publishedDate,
            $item['longitude'],
            $item['latitude']
        ]);
    }

    echo "Daten erfolgreich eingefügt.";
} catch (PDOException $e) {
    die("Verbindung zur Datenbank konnte nicht hergestellt werden: " . $e->getMessage());
}

?>
