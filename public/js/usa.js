mapboxgl.accessToken = 'pk.eyJ1IjoiY2F0aGFsLWtlbm5lYWxseSIsImEiOiJjanJ4bnE5MDgwa2o3NDRvY2E3aHJ5ZmQ2In0.D4WhDCGxN15O4UNat9M8lQ';

const bounds = [
    [ -172.7452398807572, 12.57828546005527, ],
    [ -58.76160721351644, 71.61645111692806, ]
];

const map = new mapboxgl.Map({
    container: 'map',
    style: 'mapbox://styles/mapbox/streets-v11',
    center: [-95.7129, 37.0902],
    zoom: 4,
    maxBounds: bounds
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

$.getJSON("https://gist.githubusercontent.com/Kman316/65c39034fe09ead04647f7ec05ce52b0/raw/7b396db0728f7aec400469f192de7a543f7fe664/usa-result.geojson", function(geojson) {
    console.log(geojson.features[0].geometry.coordinates);

    map.on('load', function () {
        // Adding the separate data source being handled by the clustering side of things
        map.addSource('firesagg', {
                type: "geojson",
                data: geojson,
                cluster: true,
                clusterMaxZoom: 14,
                clusterRadius: 40
            });
        // Adding the clustered points as a layer to the map.
        map.addLayer({
            "id": "Clusters",
            "type": "circle",
            "source": "firesagg",
            "filter": ["has", "point_count"],
            "paint": {
                "circle-color": {
                    "property": "point_count",
                    "type": "interval",
                    "stops": [
                        [0, "rgba(81, 187, 214,0.6)"],
                        [100, "rgba(241, 240, 117,0.6)"],
                        [750, "rgba(242, 140, 177,0.6)"],
                    ]
                },
                // Coloring the clustered points based on the number aggregated together.
                // Note: change to match heatmap colours maybe?
                "circle-radius": {
                    property: "point_count",
                    type: "interval",
                    stops: [
                        [0, 20],
                        [100, 30],
                        [750, 40]
                    ]
                },
            }
        });
        map.addLayer({
            id: "cluster-count",
            type: "symbol",
            "source": "firesagg",
            filter: ["has", "point_count"],
            layout: {
                "text-field": "{point_count_abbreviated}",
                "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
                "text-size": 12
            }
        });
        map.loadImage('https://raw.githubusercontent.com/Kman316/Wildfire-ML-FYP/master/fire-red.png', function(error, image) {
            if (error) throw error;
            map.addImage('wildfires', image);
            map.addLayer({
                id: "unclustered-point",
                type: "symbol",
                "source": "firesagg",
                filter: ["!", ["has", "point_count"]],
                layout: {
                    "icon-image": "wildfires"
                }
            });
        });
    });

    const popup = new mapboxgl.Popup();

    map.on('click', 'unclustered-point' ,function(e){
        const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] });

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

    // Causes clusters to, when clicked, zoom in.
    map.on('click', 'Clusters', function (e) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['Clusters'] });

        const feature = features[0];
        if (features.length) {
            map.flyTo({center: feature.geometry.coordinates, zoom: 10});
        }
    });

// Changes mouse cursor to a pointer finger whenever a cluster or unclustered point is moused over.
    map.on('mousemove', function (e) {
        const features = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point', 'Clusters'] });
        map.getCanvas().style.cursor = (features.length) ? 'pointer' : '';
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
