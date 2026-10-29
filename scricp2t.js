// 1. Create a layer group for your tea blocks
const teaBlocksLayer = L.layerGroup().addTo(map);

// 2. Fetch your GeoJSON file from the data folder
fetch('kanairo.geojson')
    .then(response => response.json())
    .then(data => {
        L.geoJson(data, {
            // Style the polygons (e.g., lush green for tea fields)
            style: {
                fillColor: '#2d6a4f',
                color: '#ffffff',
                weight: 1,
                fillOpacity: 0.7
            },
            // Show attributes from your QGIS attribute table when clicked
            onEachFeature: (feature, layer) => {
                const props = feature.properties;
                layer.bindPopup(`
                    <strong>Block Name:</strong> ${props.name || 'Tea Block'}<br>
                    <strong>Area:</strong> ${props.area || 'N/A'} ha
                `);
            }
        }).addTo(teaBlocksLayer);
    })
    .catch(error => console.error('Error loading tea blocks:', error));