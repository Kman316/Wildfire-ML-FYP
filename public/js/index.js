mapboxgl.accessToken = 'pk.eyJ1IjoiY2F0aGFsLWtlbm5lYWxseSIsImEiOiJjanJ4bnE5MDgwa2o3NDRvY2E3aHJ5ZmQ2In0.D4WhDCGxN15O4UNat9M8lQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-8.9226765, 52.1772531],
    zoom: 4
});

let geolocate;

map.addControl(new MapboxGeocoder({
    accessToken: mapboxgl.accessToken,
    mapboxgl: mapboxgl
}));

map.addControl(geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

$.getJSON("https://gist.githubusercontent.com/Kman316/e53cab32537d3f4c8a0cf24574b54c69/raw/db156c4b7aa2fcab32f85cba251a82f25a0dcaac/result.geojson", function(geojson) {
    console.log(geojson.features[0].geometry.coordinates);

    map.on('load', function () {
        map.loadImage('https://raw.githubusercontent.com/Kman316/Wildfire-ML-FYP/master/fire-red.png', function(error, image) {
            if (error) throw error;
            map.addImage('wildfires', image);
            map.addLayer({
                id: "wildfires",
                type: "symbol",
                source: {
                    type: "geojson",
                    data: geojson
                },
                layout: {
                    "icon-image": "wildfires",
                    'icon-allow-overlap': true
                }
            });
        });

        const layers = ['Kelvin(K)','305-310', '310-315', '315-320', '320-325', '325-330', '330-335', '335-340', '340+'];
        const colors = ['','#FFEDA0', '#FED976', '#FEB24C', '#FD8D3C', '#FC4E2A', '#E31A1C', '#BD0026', '#800026'];

        for (i = 0; i < layers.length; i++) {
            const layer = layers[i];
            const color = colors[i];
            const item = document.createElement('div');
            const key = document.createElement('span');
            key.className = 'legend-key';
            key.style.backgroundColor = color;

            const value = document.createElement('span');
            value.innerHTML = layer;
            item.appendChild(key);
            item.appendChild(value);
            legend.appendChild(item);
        }
    });



    const popup = new mapboxgl.Popup();

    map.on('click', function(e){
        const features = map.queryRenderedFeatures(e.point, { layers: ['wildfires'] });

        if (!features.length) {
            popup.remove();
            return;
        }
        const feature = features[0];

        popup.setLngLat(feature.geometry.coordinates)
            .setHTML("Predicted Wildfire Intensity: " + feature.properties.intensity)
            .addTo(map);

        map.getCanvas().style.cursor = features.length ? 'pointer' : '';
    });

});

 function processOK(response) {
     console.log("response");
     console.log(response);

     document.getElementById("ml-output").innerHTML = response.values[0][3].toFixed(2);
     setBarWidth(response.values[0][3])
 }

 function processNotOK() {
     chat('Error', 'Error whilst attempting to talk to Watson Machine Learning');
 }

 function getWatsonMLIntensity(message) {
     console.log('checking stashed context data');
     console.log(message);

     let ajaxData = {};
     ajaxData = message;

     $.ajax({
     	type: 'POST',
     	url: 'modelintensity',
     	data: ajaxData,
     	success: processOK,
     	error: processNotOK
     });
 }
