mapboxgl.accessToken = 'pk.eyJ1IjoiYWpsZW9uMTgwIiwiYSI6ImNsYTQ4ZDVqcTA5cHYzd21seGszbWI3eDIifQ.yaXUrccsnQ_RHZqxu7UKNw';

const map = new mapboxgl.Map({
    container: 'map', // container ID
    projection: 'globe', //globe projection rather than the default web mercator
    style: 'mapbox://styles/mapbox/satellite-v9', // style URL
    center: [-103.242715, 29.333191], // starting position [lng, lat]
    zoom: 10, // starting zoom
    pitch: 65,
    bearing: 80, 
    attributionControl: false
});

map.addControl(new mapboxgl.AttributionControl({
    customAttribution: 'Trail and boundary data source: <a href="https://public-nps.opendata.arcgis.com/">National Park Service Open Data Portal</a>'
    }));

map.on('load', () => {
    
    map.addSource('trails', {
        type: 'geojson',
        data: 'data/Big_Bend_Trails.geojson' // note, you'll have to change this if your data file is not in an enclosing folder named 'data'
    });

    map.addLayer({
      'id': 'trails-layer',
      'type': 'line',
      'source': 'trails',
      'paint': {
        'line-width': 3,
        'line-color': ['match', ['get', 'TRLCLASS'],
            'Class 1: Minimally Developed', 'red',
            'Class 2: Moderately Developed', 'orange',
            'Class 3: Developed', 'yellow',
            /*else,*/ 'blue'
        ]
      }
    });

	map.addSource('bounds', {
        type: 'geojson',
        data: 'data/BigBendBounds.geojson'// note again, you may need to change this. 
    });

    map.addLayer({
      'id': 'boundary-layer',
      'type': 'line',
      'source': 'bounds',
      'paint': {
          'line-width': 4,
          'line-color': 'black',
          'line-opacity': .6
      }
    });

    map.on('click', 'trails-layer', (e) => {
        // Create constructs and variables for the Popup on click.
        const coordinates = e.lngLat;
        const trailName = e.features[0].properties.TRLNAME;
        const trailClass = e.features[0].properties.TRLCLASS;
        var trailLength = e.features[0].properties.Miles;
        var trailLengthShort = trailLength.toFixed(2);

        // Ensure that if the map is zoomed out such that multiple
        // copies of the feature are visible, the popup appears
        // over the copy being pointed to.
        while (Math.abs(e.lngLat.lng - coordinates[0]) > 180) {
            coordinates[0] += e.lngLat.lng > coordinates[0] ? 360 : -360;
        }
         
        new mapboxgl.Popup()
            .setLngLat(coordinates)
            .setHTML('<h1>Trail Name: ' + trailName + '</h1>' + trailClass + ' trail <br>Length: ' + trailLengthShort + ' miles')
            .addTo(map);
        });
         
        // Change the cursor to a pointer when the mouse is over the places layer.
        map.on('mouseenter', 'trails-layer', () => {
            map.getCanvas().style.cursor = 'pointer';
        });
         
        // Change it back to a pointer when it leaves.
        map.on('mouseleave', 'trails-layer', () => {
            map.getCanvas().style.cursor = '';
        });

});

map.on('load', function () {
    map.addSource('mapbox-dem', {
        "type": "raster-dem",
        "url": "mapbox://mapbox.mapbox-terrain-dem-v1",
        'tileSize': 512,
        'maxzoom': 14
    });
    
    map.setTerrain({"source": "mapbox-dem", "exaggeration": 1.0});  

    map.setFog({
        'range': [-0.5, 2],
        'horizon-blend': 0.3,
        'color': 'white',
        'high-color': '#add8e6',
        'space-color': '#d8f2ff',
        'star-intensity': 0.0
    });
 });

const navControl = new mapboxgl.NavigationControl({
    visualizePitch: true
});

map.addControl(navControl, 'top-right');

const scale = new mapboxgl.ScaleControl({
    maxwidth: 80,
    unit: 'imperial'
});

map.addControl(scale);
scale.setUnit('imperial');
