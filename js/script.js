let url = 'https://197272-7.web.fhgr.ch/php/unload.php';
let data;

// Funktion holt Daten von der API und wandelt sie in JSON um
async function fetchData(url) {
    try {
        let response = await fetch(url);
        data = await response.json();
        return data;
    }
    catch (error) {
        console.log(error);
        return {};
    }
}

// Initialisierung: Daten werden geladen
async function init() {
    let response = await fetchData(url);
    data = response;

    // Suchen Sie nach dem neuesten Eintrag für 'Parkhaus City'
    const parkhausCityDaten = data['Parkhaus City'];
    const neuesteDaten = parkhausCityDaten[parkhausCityDaten.length - 1];

    const free_spaces = neuesteDaten['free_spaces'];
    const total_spaces = neuesteDaten['total_spaces'];
    const occupied_spaces = total_spaces - free_spaces;

    console.log('Freie Plätze:', free_spaces);
    console.log('Besetzte Plätze:', occupied_spaces);

    // Doughnut-Diagramm erstellen
    const belegungBasel = document.querySelector('#belegungBasel');
    const labelsDoughnut = ['Freie Parkplätze', 'Besetzte Parkplätze'];
    const doughnutData = {
        labels: labelsDoughnut,
        datasets: [{
            label: 'Parkhausbelegung',
            data: [free_spaces, occupied_spaces],
            backgroundColor: [
                'rgb(93, 45, 154)',
                'rgb(227, 220, 236)'
            ]
        }]
    };

    new Chart(belegungBasel, {
        type: 'doughnut',
        data: doughnutData,
        options: {}
    });

    // Liniendiagramm erstellen
    const vorhersageBasel = document.querySelector('#vorhersageDiagramm');
    let durchschnittsFreiePlaetze = berechneDurchschnittFreiePlaetze(parkhausCityDaten);

    const labelsLine = [...Array(24).keys()].map(stunde => `${stunde < 10 ? '0' : ''}${stunde}:00`);
    const lineData = {
        labels: labelsLine,
        datasets: [{
            label: 'Durchschnittlich freie Plätze',
            data: durchschnittsFreiePlaetze,
            borderColor: 'rgb(93, 45, 154)',
            tension: 0.1
        }]
    };

    new Chart(vorhersageBasel, {
        type: 'line',
        data: lineData,
        options: {
            scales: {
                x: {
                    ticks: {
                        autoSkip: true,
                        maxTicksLimit: 12
                    }
                },
                y: {
                    beginAtZero: true,
                    suggestedMax: total_spaces,
                    ticks: {
                        stepSizes: 100
                    }
                }
            }
        }
    });

    // Leaflet-Karte
    var map = L.map('map').setView([47.5596, 7.5886], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 8,
        attribution: '© OpenStreetMap'
    }).addTo(map);


    // Benutzerdefiniertes Icon für den Marker
var customIcon = L.icon({
  iconUrl: 'Bilder/Stecknadel.png', // Pfad zum Icon-Bild
  iconSize: [28.5, 38], // Größe des Icons
  iconAnchor: [12, 41], // Ankerpunkt des Icons
  popupAnchor: [1, -34] // Ankerpunkt des Popups
});

    // Marker für 'Parkhaus City' setzen
    if (neuesteDaten.latitude && neuesteDaten.longitude) {
      L.marker([parseFloat(neuesteDaten.latitude), parseFloat(neuesteDaten.longitude)], {icon: customIcon}).addTo(map)
            .bindPopup(`<b>${neuesteDaten.name}</b><br>Freie Plätze: ${free_spaces}<br>Total Plätze: ${total_spaces}<br> <div>
            <canvas id="vorhersageDiagramm"></canvas>
            </div>`);
    }




    
}

function berechneDurchschnittFreiePlaetze(parkhausCityDaten, wochentagIndex) {
    // Daten sortieren, damit die neuesten Einträge am Ende stehen
    let sortierteDaten = parkhausCityDaten.sort((a, b) => new Date(a.published) - new Date(b.published));

    // Nur Daten des ausgewählten Wochentags herausfiltern
    let wochentagsDaten = sortierteDaten.filter(datum => new Date(datum.published).getDay() === wochentagIndex);

    // Nur die Daten der letzten vier ausgewählten Wochentage nehmen
    let letzteVierWochentage = wochentagsDaten.slice(-4);

    // Stundenweise Datenstruktur vorbereiten
    let stundenDaten = new Array(24).fill(0).map(() => []);

    // Daten den Stunden zuordnen
    letzteVierWochentage.forEach(datum => {
        let date = new Date(datum.published);
        let stunde = date.getHours();
        stundenDaten[stunde].push(datum.free_spaces);
    });

    // Durchschnitt für jede Stunde berechnen
    return stundenDaten.map(stundenListe => {
        if (stundenListe.length === 0) return 0;
        let durchschnitt = stundenListe.reduce((sum, curr) => sum + curr, 0) / stundenListe.length;
        return Math.ceil(durchschnitt);
    });
}

document.getElementById('wochentagAuswahl').addEventListener('change', async (event) => {
    let wochentagIndex = parseInt(event.target.value);
    let parkhausCityDaten = await fetchData(url); // Daten neu laden
    let durchschnittsFreiePlaetze = berechneDurchschnittFreiePlaetze(parkhausCityDaten['Parkhaus City'], wochentagIndex);
    // Aktualisieren Sie hier Ihre Diagramme oder andere UI-Elemente mit den neuen Daten
});


init();
