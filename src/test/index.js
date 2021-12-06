import Map from '@arcgis/core/Map';
import MapView from '@arcgis/core/views/MapView';
import config from '@arcgis/core/config';
import apiToken from './token';
import Ellipsis from '../lib/Ellipsis';

config.apiKey = apiToken;

const map = new Map({
    basemap: "arcgis-topographic" // Basemap layer service
});

const view = new MapView({
    map: map,
    center: [-118.805, 34.027], // Longitude, latitude
    zoom: 13, // Zoom level
    container: 'map' // Div element
});
map.add(Ellipsis.RasterLayer(
    '2057fd2a-66c5-46ef-9c71-bb8f7a180c44',
    ''
), 0);


