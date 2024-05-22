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
    }
    catch (error) {
        // console.log(error);
        return {};
    }
}

// Initialisierung: Daten werden geladen
async function init() {
   // Leaflet-Karte
   var map = L.map('map').setView([47.5596, 7.5886], 13);
   L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
       maxZoom: 19,
       minZoom: 8,
       attribution: '© OpenStreetMap'
   }).addTo(map);

    let response = await fetchData(url);
    parkhausDaten = response;
    // console.log(typeof parkhausDaten);
    // console.log(parkhausDaten);
    let heuteee = new Date();
    let wti = heuteee.getDay();
    wochenTagAuswahl.value = wti;
    

    // Suchen Sie nach dem neuesten Eintrag für 'Parkhaus City'
    //const parkhausCityDaten = parkhausDaten['Parkhaus City'];

    for (const [key, value] of Object.entries(parkhausDaten)) {
        
        // console.log(key);
        const parkhausCityDaten = value;
        // console.log(parkhausCityDaten);

        const neuesteDaten = parkhausCityDaten[parkhausCityDaten.length - 1];

        const free_spaces = neuesteDaten['free_spaces'];
        const total_spaces = neuesteDaten['total_spaces'];
        const occupied_spaces = total_spaces - free_spaces;

        // console.log('Freie Plätze:', free_spaces);
        // console.log('Besetzte Plätze:', occupied_spaces);

         // Benutzerdefiniertes Icon für den Marker
         var customIcon = L.icon({
            iconUrl: 'Bilder/Stecknadel.png', // Pfad zum Icon-Bild
            iconSize: [28.5, 38], // Größe des Icons
            iconAnchor: [12, 41], // Ankerpunkt des Icons
            popupAnchor: [1, -34] // Ankerpunkt des Popups
        });

        // Marker für 'Parkhaus City' setzen
        let popupDiv = document.createElement("div");
        popupDiv.classList.add('popup-content');
        let neuDat = document.createElement("b");
        neuDat.innerHTML = `<b>${neuesteDaten.name}</b><br>Freie Plätze: ${free_spaces}<br>Total Plätze: ${total_spaces}<br>`;
        popupDiv.appendChild(neuDat);
        let doghnutCanvas = document.createElement("canvas");
        let linechartCanvas = document.createElement("canvas");
        popupDiv.appendChild(doghnutCanvas);
        popupDiv.appendChild(linechartCanvas);
    
        

        // Doughnut-Diagramm erstellen
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

        doughnutChart = new Chart(doghnutCanvas, {
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

        lineChart =  new Chart(linechartCanvas, {
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
        lineChartArray.push(lineChart);


   

        if (neuesteDaten.latitude && neuesteDaten.longitude) {
            let marker = L.marker([parseFloat(neuesteDaten.latitude), parseFloat(neuesteDaten.longitude)], { icon: customIcon })
                .addTo(map).bindPopup(popupDiv);
        
            // Füge einen Event-Listener hinzu, der die Karte auf den Marker zentriert, wenn das Popup geöffnet wird
            marker.on('popupopen', function (e) {
                // Neue Variable für die Position des Markers
                let markerLatLng = e.target.getLatLng();
                
                // Berechne die neue Position, um Platz für das Popup zu schaffen
                let offset = [0, 250]; // Beispiel-Offset: 100 Pixel nach oben
                let newLatLng = map.project(markerLatLng).subtract(offset);
                newLatLng = map.unproject(newLatLng);
                
                // Karte auf die neue Position zentrieren
                map.setView(newLatLng, map.getZoom(), { animate: true });
            });
        }
                

        
        fillLineChart(lineChart, parkhausCityDaten, wti) 


    };




/*
    fillLineChart(wti);
*/

}

function berechneDurchschnittFreiePlaetze(parkhausCityDaten, wochentagIndex) {
    // Daten sortieren, damit die neuesten Einträge am Ende stehen
    let sortierteDaten = parkhausCityDaten.sort((a, b) => new Date(a.published) - new Date(b.published));

    // Nur Daten des ausgewählten Wochentags herausfiltern
    let wochentagsDaten = sortierteDaten.filter(datum => new Date(datum.published).getDay() === wochentagIndex);
    // Nur die Daten der letzten vier ausgewählten Wochentage nehmen
    let letzteVierWochentage = wochentagsDaten.slice(-(4*24*4)); //letzte x Wochen -> x*24*4
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
wochenTagAuswahl.addEventListener('change', async (event) => {
    let wochentagIndex = parseInt(event.target.value);
    let i = 0;
    for (const [key, value] of Object.entries(parkhausDaten)) {
        let durchschnittsFreiePlaetze = berechneDurchschnittFreiePlaetze(value, wochentagIndex);
        lineChartArray[i].data.datasets[0].data = durchschnittsFreiePlaetze;
        lineChartArray[i].update();
        i++;
    }

});

function fillLineChart(chart, pDaten, dayIndex) {

    let durchschnittsFreiePlaetze = berechneDurchschnittFreiePlaetze(pDaten, dayIndex);

    // Aktualisieren des Liniendiagramms
    chart.data.datasets[0].data = durchschnittsFreiePlaetze;
    chart.update();
}
// Dynamische Anpassung der Kartenhöhe
window.addEventListener('resize', function() {
    let mapElement = document.getElementById('map');
    if (window.innerWidth <= 600) {
        mapElement.style.height = '300px';
    } else if (window.innerWidth <= 1024) {
        mapElement.style.height = '500px';
    } else {
        mapElement.style.height = '600px';
    }
});

// Initiale Ausführung
(function() {
    let mapElement = document.getElementById('map');
    if (window.innerWidth <= 600) {
        mapElement.style.height = '300px';
    } else if (window.innerWidth <= 1024) {
        mapElement.style.height = '500px';
    } else {
        mapElement.style.height = '600px';
    }
})();

init();