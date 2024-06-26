let url = 'https://197272-7.web.fhgr.ch/php/unload.php';
let parkhausDaten;
let doughnutChart, lineChart;  // Globale Variablen für die Diagramme
let lineChartArray = [];
let wochenTagAuswahl = document.getElementById('wochentagAuswahl');

// Funktion holt Daten von der API und wandelt sie in JSON um
async function fetchData(url) {
    try {
        let response = await fetch(url);
        let data = await response.json();
        return data;
    } catch (error) {
        return {};
    }
}

// Initialisierung: Daten werden geladen
async function init() {
    var map = L.map('map').setView([47.5596, 7.5886], 13);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        minZoom: 8,
        attribution: '© OpenStreetMap'
    }).addTo(map);

    parkhausDaten = await fetchData(url);
    let heuteee = new Date();
    let wti = heuteee.getDay();
    wochenTagAuswahl.value = wti;

    for (const [key, value] of Object.entries(parkhausDaten)) {
<<<<<<< HEAD
        
=======
>>>>>>> 90b3f34c7e4a9fd65f819df4ae6c1c5f97f1414e
        const parkhausCityDaten = value;
        const neuesteDaten = parkhausCityDaten[parkhausCityDaten.length - 1];
        const free_spaces = neuesteDaten['free_spaces'];
        const total_spaces = neuesteDaten['total_spaces'];
        const occupied_spaces = total_spaces - free_spaces;

<<<<<<< HEAD

         // Benutzerdefiniertes Icon für den Marker
         var customIcon = L.icon({
            iconUrl: 'Bilder/Stecknadel.png', // Pfad zum Icon-Bild
            iconSize: [28.5, 38], // Größe des Icons
            iconAnchor: [12, 41], // Ankerpunkt des Icons
            popupAnchor: [1, -34] // Ankerpunkt des Popups
=======
        var customIcon = L.icon({
            iconUrl: 'Bilder/Stecknadel.png',
            iconSize: [28.5, 38],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34]
>>>>>>> 90b3f34c7e4a9fd65f819df4ae6c1c5f97f1414e
        });

        let popupDiv = document.createElement("div");
        popupDiv.classList.add('popup-content');

        let neuDat = document.createElement("b");
<<<<<<< HEAD
        neuDat.innerHTML = `<b>${neuesteDaten.name}</b>`;
        popupDiv.appendChild(neuDat);

        // Bemerkung "Aktuelle Belegung" und "Total Parkplätze"hinzufügen
        const totalSpaces = neuesteDaten['total_spaces'];
        let aktuelleBelegungText = document.createElement("p");
        aktuelleBelegungText.innerHTML = `<b>Aktuelle Belegung</b><br>Total Parkplätze: ${totalSpaces}`;
        popupDiv.appendChild(aktuelleBelegungText);
        
        let doghnutCanvas = document.createElement("canvas");
        popupDiv.appendChild(doghnutCanvas);

        // Bemerkung "Prognose" hinzufügen
        let prognoseText = document.createElement("p");
        prognoseText.innerHTML = "<b>Prognose</b>";
        popupDiv.appendChild(prognoseText);

        let linechartCanvas = document.createElement("canvas");
=======
        neuDat.innerHTML = `<b>${neuesteDaten.name}</b><br>Freie Plätze: ${free_spaces}<br>Total Plätze: ${total_spaces}<br>`;
        popupDiv.appendChild(neuDat);
        let doghnutCanvas = document.createElement("canvas");
        let linechartCanvas = document.createElement("canvas");
        popupDiv.appendChild(doghnutCanvas);
>>>>>>> 90b3f34c7e4a9fd65f819df4ae6c1c5f97f1414e
        popupDiv.appendChild(linechartCanvas);

        const doughnutData = {
            labels: ['Freie Parkplätze', 'Besetzte Parkplätze'],
            datasets: [{
                label: 'Parkhausbelegung',
                data: [free_spaces, occupied_spaces],
                backgroundColor: ['rgb(93, 45, 154)', 'rgb(227, 220, 236)']
            }]
        };

        doughnutChart = new Chart(doghnutCanvas, {
            type: 'doughnut',
            data: doughnutData,
            options: {
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
           

        const labelsLine = [...Array(24).keys()].map(stunde => `${stunde < 10 ? '0' : ''}${stunde}:00`);
        const lineData = {
            labels: labelsLine,
            datasets: [{
                label: 'Durchschnittlich freie Plätze',
                data: berechneDurchschnittFreiePlaetze(parkhausCityDaten, wti),
                borderColor: 'rgb(93, 45, 154)',
                tension: 0.1
            }]
        };

        lineChart = new Chart(linechartCanvas, {
            type: 'line',
            data: lineData,
            options: {
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                },
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
                            stepSize: 100
                        }
                    }
                }
            }
        });
        lineChartArray.push(lineChart);

        if (neuesteDaten.latitude && neuesteDaten.longitude) {
            let marker = L.marker([parseFloat(neuesteDaten.latitude), parseFloat(neuesteDaten.longitude)], { icon: customIcon })
                .addTo(map).bindPopup(popupDiv);

            marker.on('popupopen', function (e) {
                let markerLatLng = e.target.getLatLng();
<<<<<<< HEAD
                
                // Berechne die neue Position, um Platz für das Popup zu schaffen
                let offset = [0, 300];
=======
                let offset = [0, 250];
>>>>>>> 90b3f34c7e4a9fd65f819df4ae6c1c5f97f1414e
                let newLatLng = map.project(markerLatLng).subtract(offset);
                newLatLng = map.unproject(newLatLng);
                map.setView(newLatLng, map.getZoom(), { animate: true });
            });
        }

        fillLineChart(lineChart, parkhausCityDaten, wti);
    }
}

function berechneDurchschnittFreiePlaetze(parkhausCityDaten, wochentagIndex) {
    let sortierteDaten = parkhausCityDaten.sort((a, b) => new Date(a.published) - new Date(b.published));
    let wochentagsDaten = sortierteDaten.filter(datum => new Date(datum.published).getDay() === wochentagIndex);
<<<<<<< HEAD
    // Nur die Daten der letzten vier ausgewählten Wochentage nehmen
    let letzteVierWochentage = wochentagsDaten.slice(-(4*24*4)); //letzte x Wochen -> x*24*4
    // Stundenweise Datenstruktur vorbereiten
=======
    let letzteVierWochentage = wochentagsDaten.slice(-(1 * 24 * 4));
>>>>>>> 90b3f34c7e4a9fd65f819df4ae6c1c5f97f1414e
    let stundenDaten = new Array(24).fill(0).map(() => []);

    letzteVierWochentage.forEach(datum => {
        let date = new Date(datum.published);
        let stunde = date.getHours();
        stundenDaten[stunde].push(datum.free_spaces);
    });

    return stundenDaten.map(stundenListe => {
        if (stundenListe.length === 0) return 0;
        let durchschnitt = stundenListe.reduce((sum, curr) => sum + curr, 0) / stundenListe.length;
        return Math.ceil(durchschnitt);
    });
}

wochenTagAuswahl.addEventListener('change', async (event) => {
    let wochentagIndex = parseInt(event.target.value);
    lineChartArray.forEach((chart, i) => {
        let durchschnittsFreiePlaetze = berechneDurchschnittFreiePlaetze(Object.values(parkhausDaten)[i], wochentagIndex);
        chart.data.datasets[0].data = durchschnittsFreiePlaetze;
        chart.update();
    });
});

function fillLineChart(chart, pDaten, dayIndex) {
    chart.data.datasets[0].data = berechneDurchschnittFreiePlaetze(pDaten, dayIndex);
    chart.update();
}

// Dynamische Anpassung der Kartenhöhe
function adjustMapHeight() {
    let mapElement = document.getElementById('map');
    if (window.innerWidth <= 600) {
        mapElement.style.height = '300px';
    } else if (window.innerWidth <= 1024) {
        mapElement.style.height = '500px';
    } else {
        mapElement.style.height = '600px';
    }
}

window.addEventListener('resize', adjustMapHeight);
document.addEventListener('DOMContentLoaded', () => {
    adjustMapHeight();
    init();
});
