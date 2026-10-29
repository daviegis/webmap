// Default view coordinates (Maseno Region)
const initialCenter = [-0.0039, 34.6012];
const initialZoom = 16;

const map = L.map('map', { zoomControl: false }).setView(initialCenter, initialZoom);

// Add custom zoom control position
L.control.zoom({ position: 'topleft' }).addTo(map);

// OpenStreetMap Tile Layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Define Layer Categories with distinct colors
const layerConfigs = [
    { key: 'admin', label: 'Administration', color: '#0d3b66', file: 'data/administration.geojson' },
    { key: 'hostels', label: 'Hostels', color: '#2a9d8f', file: 'data/hostels.geojson' },
    { key: 'labs', label: 'Labs', color: '#e76f51', file: 'data/labs.geojson' }
];

const overlayLayers = {};
const allFeatures = [];

// Initialize Legend UI
const legendList = document.getElementById('legend-list');
document.getElementById('theme-count').innerText = `${layerConfigs.length} DATA THEMES`;

layerConfigs.forEach(config => {
    // Build legend items
    const li = document.createElement('li');
    li.className = 'legend-item';
    li.innerHTML = `<span class="legend-color" style="background:${config.color}"></span> ${config.label}`;
    legendList.appendChild(li);

    // Initialize Leaflet Layer Groups
    const group = L.layerGroup().addTo(map);
    overlayLayers[config.label] = group;

    // Fetch GeoJSON data
    fetch(config.file)
        .then(res => res.json())
        .then(data => {
            const geoLayer = L.geoJson(data, {
                style: {
                    fillColor: config.color,
                    color: '#ffffff',
                    weight: 1.5,
                    fillOpacity: 0.75
                },
                onEachFeature: (feature, layer) => {
                    const name = feature.properties.name || 'Unnamed Feature';
                    
                    // Bind popup card
                    layer.bindPopup(`
                        <div style="font-size:13px;">
                            <strong style="color:${config.color};">${name}</strong><br>
                            <b>Category:</b> ${config.label}<br>
                            ${feature.properties.description ? `<b>Info:</b> ${feature.properties.description}` : ''}
                        </div>
                    `);

                    // Collect feature reference for quick search
                    allFeatures.push({ name: name, layer: layer });
                    populateDropdown(name);
                }
            });
            geoLayer.addTo(group);
        })
        .catch(err => console.warn(`Note: Could not load ${config.file}. Place valid GeoJSON files in /data directory.`));
});

// Add native Leaflet Layer Toggle control (Top-Right)[cite: 1]
L.control.layers(null, overlayLayers, { collapsed: false, position: 'topright' }).addTo(map);

// Populate Dropdown Options
function populateDropdown(name) {
    const select = document.getElementById('facility-select');
    const option = document.createElement('option');
    option.value = name;
    option.textContent = name;
    select.appendChild(option);
}

// Search and Highlight Logic
function searchAndZoom(searchTerm) {
    if (!searchTerm) return;
    const match = allFeatures.find(f => f.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (match) {
        map.fitBounds(match.layer.getBounds(), { maxZoom: 18, animate: true });
        match.layer.openPopup();
    } else {
        alert('Facility not found!');
    }
}

// Event Listeners
document.getElementById('search-btn').addEventListener('click', () => {
    searchAndZoom(document.getElementById('search-input').value);
});

document.getElementById('search-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') searchAndZoom(e.target.value);
});

document.getElementById('facility-select').addEventListener('change', (e) => {
    searchAndZoom(e.target.value);
});

document.getElementById('reset-view-btn').addEventListener('click', () => {
    map.setView(initialCenter, initialZoom);
});

document.getElementById('collapse-btn').addEventListener('click', () => {
    document.getElementById('sidebar').classList.toggle('collapsed');
});