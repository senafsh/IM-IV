<?php

function fetchParkingData() {
    $url = "https://data.bs.ch/api/explore/v2.1/catalog/datasets/100088/records?limit=20";

    // Initialisiert eine cURL-Sitzung
    $ch = curl_init($url);

    // Setzt Optionen (fetch mit php)
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    // Führt die cURL-Sitzung aus und erhält den Inhalt
    $response = curl_exec($ch);

    // Schließt die cURL-Sitzung
    curl_close($ch);

    // Dekodiert die JSON-Antwort und gibt Daten zurück
    return json_decode($response, true);
    // echo $response;
}

// Gibt die Daten zurück, wenn dieses Skript eingebunden ist
return fetchParkingData();
?>