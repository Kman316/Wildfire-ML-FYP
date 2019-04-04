    const fires = $.ajax({
        url: "https://gist.githubusercontent.com/Kman316/e53cab32537d3f4c8a0cf24574b54c69/raw/db156c4b7aa2fcab32f85cba251a82f25a0dcaac/result.geojson",
        dataType: "json",
        success: console.log("Wildfire data successfully loaded."),
        error: function (xhr) {
            alert(xhr.statusText)
        }
    });

    console.log(fires);

    $.when(fires).done(function() {
        mapboxgl.accessToken = 'pk.eyJ1IjoiY2F0aGFsLWtlbm5lYWxseSIsImEiOiJjanJ4bnE5MDgwa2o3NDRvY2E3aHJ5ZmQ2In0.D4WhDCGxN15O4UNat9M8lQ';
        const map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/mapbox/streets-v11',
            center: [-8.9226765, 52.1772531],
            zoom: 4
        });

        let geolocate;
        const file = "https://gist.githubusercontent.com/Kman316/e53cab32537d3f4c8a0cf24574b54c69/raw/db156c4b7aa2fcab32f85cba251a82f25a0dcaac/result.geojson";

        map.addControl(geolocate = new mapboxgl.GeolocateControl({
            positionOptions: {
                enableHighAccuracy: true
            },
            trackUserLocation: true
        }));

        map.on('load', function () {
            map.addLayer({
                id: 'wildfires',
                type: 'symbol',
                source: {
                    type: 'geojson',
                    data: fires.responseJSON
                },
                paint: {}
            });
            fires.responseJSON.features.forEach(function (marker) {
                // create a DOM element for the marker
                const el = document.createElement('div');
                el.className = 'markerred';

                // add marker to map
                new mapboxgl.Marker(el)
                    .setLngLat(marker.geometry.coordinates)
                    .addTo(map);
            });
        })
    });
/*
 function setBarWidth(value) {
   var scale = {
     min : 225,
     max : 370
   }
   // calculate % along scale, i.e. width of the bar
     let width = 100 * (value - scale.min) / (scale.max - scale.min);
     // if width < 0, set to 0
   width = (width < 0 ? 0 : width);
   // if width > 100, set to 100
   width = (width > 100 ? 100 : width);
   // set the width of the bar
   document.getElementById('bar-fill').style.width = width + '%';

   // define an array of colors to set the bar to, depending on <width>
     const colors = ['#aa0202', '#ff5500', '#ffa500', '#ffd800', '#f8e683'];
     // how big is each color category
     const binSize = (scale.max - scale.min) / (colors.length + 1);
     // get the relevant color from the array, based on the width of the bar
   color = colors[Math.round(width/binSize)];
   // set the color of the bar
   document.getElementById('bar-fill').style.backgroundColor = color;
 }

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
 */
