//CREAR MAPA
var map = L.map('map').setView([40.44388056, -3.62751111], 12);

var map2 = L.map('map2').setView([36.69707456, -6.125786999], 12);

//Capa personalizada
var Stadia_StamenTerrain = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 0,
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
}).addTo(map);

var Stadia_StamenTerrain = L.tileLayer('https://tiles.stadiamaps.com/tiles/stamen_terrain/{z}/{x}/{y}{r}.{ext}', {
    minZoom: 0,
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.stadiamaps.com/" target="_blank">Stadia Maps</a> &copy; <a href="https://www.stamen.com/" target="_blank">Stamen Design</a> &copy; <a href="https://openmaptiles.org/" target="_blank">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    ext: 'png'
}).addTo(map2);

// GRUPO PARA TERREMOTOS FILTRADOS EN MAPA 2
const earthquakesLayer = L.layerGroup().addTo(map2);

//Agregar marcador mapa 1
const marker = L.marker([40.44388056, -3.62751111])
    .bindPopup("aquí se ven almendros florecidos")
    .addTo(map);
;

//agregar marcador mapa 2
const marker2 = L.marker([36.69707456, -6.125786999])
    .bindPopup("VIVA LA FERIA")
    .addTo(map2);
;

//Crear iconos personalizados
const icons = [];

for (let i = 0; i < 8; i++) {
    icons.push(L.icon({
        iconUrl: `assets/icon${i}.png`,
        iconSize: [30, 30],
        iconAnchor: [15, 30],
        popupAnchor: [0, -30]
    }));
}

function getIconByMagnitude(mag) {
    if (mag < 1) return icons[0];
    else if (mag < 2) return icons[1];
    else if (mag < 3) return icons[2];
    else if (mag < 4) return icons[3];
    else if (mag < 5) return icons[4];
    else if (mag < 6) return icons[5];
    else if (mag < 7) return icons[6];
    else return icons[7];
}

//terremotos y popup    
async function getData() {
    try {
        const res = await fetch("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson");
        const data = await res.json();
        return data.features;
    }
    catch (e) {
        console.log(e);
    }
}
getData().then(data => {
    console.log(data);

    //Agregar marcador
    data.map(pin => {
        //Tratamiento de datos
        // [lat,lon]
        const coordinates_pin = [pin.geometry.coordinates[1], pin.geometry.coordinates[0]];
        console.log(coordinates_pin);

        const fecha = new Date(pin.properties.time).toLocaleString();
        const mag = pin.properties.mag;
        const customIcon = getIconByMagnitude(mag);

        // Crear contenido del popup
        const popupHtml = `
                <strong>${pin.properties.title}</strong><br>
                <b>Fecha:</b> ${fecha}<br>
                <b>Ubicación:</b> ${pin.properties.place}<br>
                <b>Código:</b> ${pin.id}<br>
                <b>Magnitud:</b> ${pin.properties.mag} (${pin.properties.magType})
         `;
        // Crear el marcador con popup
        L.marker(coordinates_pin, { icon: customIcon })
            .bindPopup(popupHtml)
            .addTo(map);
    });
});

// FORMULARIO DE FILTRO (mapa2)
const form = document.getElementById("filters");

form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const minMag = document.getElementById("minMag").value;
    const startDate = document.getElementById("startDate").value;
    const endDate = document.getElementById("endDate").value;

    const url = `https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&starttime=${startDate}&endtime=${endDate}&minmagnitude=${minMag}`;

    try {
        const res = await fetch(url);
        const data = await res.json();
        console.log("Filtrados:", data.features);
        showEarthquakes(data.features);
    } catch (err) {
        console.error("Error al cargar datos filtrados:", err);
    }
});

function showEarthquakes(earthquakes) {
    earthquakesLayer.clearLayers();

    earthquakes.forEach(eq => {
        const coords = [eq.geometry.coordinates[1], eq.geometry.coordinates[0]];
        const mag = eq.properties.mag;
        const icon = getIconByMagnitude(mag);

        const popupHtml = `
            <strong>${eq.properties.title}</strong><br>
            Magnitud: ${mag}<br>
            Fecha: ${new Date(eq.properties.time).toLocaleString()}
        `;

        L.marker(coords, { icon })
            .bindPopup(popupHtml)
            .addTo(earthquakesLayer);
    });
}