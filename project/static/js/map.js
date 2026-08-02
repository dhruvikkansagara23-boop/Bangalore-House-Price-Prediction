let map = null;
let mapMarker = null;
let heatLayer = null;

window.initMap = function() {
    map = L.map('propertyMap').setView([12.9716, 77.5946], 11); // Center of Bangalore
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);
};

window.updateMapLocation = function(locationName) {
    if(!map || !locationName) return;
    
    var query = locationName + ", Bangalore, India";
    fetch("https://nominatim.openstreetmap.org/search?format=json&q=" + encodeURIComponent(query))
        .then(r => r.json())
        .then(data => {
            if(data && data.length > 0) {
                var lat = data[0].lat;
                var lon = data[0].lon;
                map.setView([lat, lon], 14);
                
                if(mapMarker) map.removeLayer(mapMarker);
                mapMarker = L.marker([lat, lon]).addTo(map)
                    .bindPopup("📍 " + locationName)
                    .openPopup();
                
                // Add an artificial heatmap around the selected area to represent price density/demand
                if(heatLayer) map.removeLayer(heatLayer);
                
                // Generate some randomized points around the center for the heatmap
                var heatPoints = [];
                for(var i=0; i<30; i++) {
                    var latOffset = (Math.random() - 0.5) * 0.02;
                    var lonOffset = (Math.random() - 0.5) * 0.02;
                    var intensity = Math.random();
                    heatPoints.push([parseFloat(lat) + latOffset, parseFloat(lon) + lonOffset, intensity]);
                }
                
                // Only render if L.heatLayer exists (leaflet-heat plugin)
                if (typeof L.heatLayer !== 'undefined') {
                    heatLayer = L.heatLayer(heatPoints, {
                        radius: 25,
                        blur: 15,
                        maxZoom: 14,
                        gradient: {0.4: 'blue', 0.65: 'lime', 1: 'red'}
                    }).addTo(map);
                }
            }
        }).catch(e => console.error("Geocoding failed", e));
};
