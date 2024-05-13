<?php

// Bindet das Skript für Rohdaten ein
$data = include('extract.php');

// Initialisiert ein Array, um die transformierten Daten zu speichern
$transformedData = [];

// Transformiert und fügt die notwendigen Informationen hinzu
foreach ($data['results'] as $parking) {
    // Überprüft, ob alle erforderlichen Daten vorhanden sind
    if (isset($parking['title'], $parking['free'], $parking['total'], $parking['geo_point_2d'])) {
        // Berechnet den Prozentsatz der freien Parkplätze
        $freePercentage = ($parking['total'] > 0) ? ($parking['free'] / $parking['total']) * 100 : 0;

        // Fügt das Parkhaus zum transformierten Datenarray hinzu
        $transformedData[] = [
            'name' => $parking['title'],
            'free_spaces' => $parking['free'],
            'published' => $parking['published'],
            'total_spaces' => $parking['total'],
            'longitude' => $parking['geo_point_2d']['lon'],
            'latitude' => $parking['geo_point_2d']['lat']
        ];
    }
}

// Kodiert die transformierten Daten in JSON
$jsonData = json_encode($transformedData, JSON_PRETTY_PRINT);

// Gibt die JSON-Daten zurück, anstatt sie auszugeben
return $jsonData;
?>
