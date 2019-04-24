mapboxgl.accessToken = 'pk.eyJ1IjoiY2F0aGFsLWtlbm5lYWxseSIsImEiOiJjanJ4bnE5MDgwa2o3NDRvY2E3aHJ5ZmQ2In0.D4WhDCGxN15O4UNat9M8lQ';
const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-8.9226765, 52.1772531],
    zoom: 4
});

let geolocate;

map.addControl(geolocate = new mapboxgl.GeolocateControl({
    positionOptions: {
        enableHighAccuracy: true
    },
    trackUserLocation: true
}));

$.getJSON("https://gist.githubusercontent.com/Kman316/65c39034fe09ead04647f7ec05ce52b0/raw/7b396db0728f7aec400469f192de7a543f7fe664/usa-result.geojson", function(geojson) {
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
