<?php

// Datenbankkonfiguration einbinden
require_once 'config.php';

// Header setzen, um JSON-Inhaltstyp zurückzugeben
header('Content-Type: application/json');

try {
    // Erstellt eine neue PDO-Instanz mit der Konfiguration aus config.php
    $pdo = new PDO($dsn, $username, $password, $options);

    // SQL-Query, um Daten basierend auf dem Standort auszuwählen, sortiert nach Zeitstempel
    $sql = "SELECT * 
    FROM parking_status";

    // Bereitet die SQL-Anweisung vor
    $stmt = $pdo->prepare($sql);

    // Führt die Abfrage aus
    $stmt->execute();

    // Holt alle passenden Einträge
    $results = $stmt->fetchAll(PDO::FETCH_ASSOC);

    // Erstellt ein neues Array, in dem jedes Parkhaus als Node erscheint
    $parkingNodes = [];
    foreach ($results as $row) {
        // Nimmt an, dass 'name' der eindeutige Schlüssel für jedes Parkhaus ist
        $name = $row['name'];
        if (!isset($parkingNodes[$name])) {
            $parkingNodes[$name] = [];
        }
        // Fügt die restlichen Daten unter diesem Parkhaus hinzu
        $parkingNodes[$name][] = $row;
    }

    // Gibt die Ergebnisse im JSON-Format zurück
    echo json_encode($parkingNodes);
} catch (PDOException $e) {
    // Gibt eine Fehlermeldung zurück, wenn etwas schiefgeht
    echo json_encode(['error' => $e->getMessage()]);
}
?>
