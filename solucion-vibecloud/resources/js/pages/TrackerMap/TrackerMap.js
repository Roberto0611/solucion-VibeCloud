
start = [-84.518641, 39.134270]; // starting position [lng, lat]
end = [-84.512023, 39.102779]; // starting position [lng, lat]

// create a function to make a directions request and update the destination
mapboxgl.accessToken = "pk.eyJ1IjoiYWxkb2thciIsImEiOiJjbWY5MGllcmUwZDhiMmxxMzVvMHI1dXZyIn0.RA1iYVqkrsZEEqlWoy6foQ"


async function getRoute(end) {
    // make a directions request using cycling profile
    const query = await fetch(
        `https://api.mapbox.com/directions/v5/mapbox/cycling/${start[0]},${start[1]};${end[0]},${end[1]}?steps=true&geometries=geojson&access_token=${mapboxgl.accessToken}`
    );
    const json = await query.json();

    console.log('Mapbox raw JSON:', json);
    console.log('Mapbox raw JSON (pretty):\n', JSON.stringify(json, null, 2));

    const data = json.routes && json.routes[0];
    console.log('First route object:', data);

    const route = data.geometry;
    const geojson = {
        'type': 'Feature',
        'properties': {},
        'geometry': route
    };

    console.log('GeoJSON to add:', geojson);
    console.log('GeoJSON coords sample:', geojson.geometry?.coordinates?.slice?.(0, 3));



    if (Map.getSource('route')) {
        // if the route already exists on the map, reset it using setData
        Map.getSource('route').setData(geojson);
    }

    // otherwise, add a new layer using this data
    else {
        Map.addLayer({
            id: 'route',
            type: 'line',
            source: {
                type: 'geojson',
                data: geojson
            },
            layout: {
                'line-join': 'round',
                'line-cap': 'round'
            },
            paint: {
                'line-color': '#3887be',
                'line-width': 5,
                'line-opacity': 0.75
            }
        });
    }
}