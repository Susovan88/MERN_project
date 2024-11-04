// map.js

// Initialize the map
const map = L.map('map').setView(coordinates, 13);

// Add a tile layer
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  maxZoom: 19,
  attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
}).addTo(map);

// console.log(coordinates);

const customIcon = L.divIcon({
  className: 'custom-marker', // Class for custom styling
  html: '<i class="fas fa-house-chimney-window"></i>', // Font Awesome icon
  iconSize: [40, 40], // Size of the icon
  iconAnchor: [17, 35], // The point of the icon which will correspond to marker's location
  popupAnchor: [0, -28] // The point from which the popup should open relative to the iconAnchor
});

// Add a marker with a popup
const marker = L.marker(coordinates, { icon: customIcon }).addTo(map);
marker.bindPopup('<b>NextDestination</b><br>Here you will be').openPopup();
