//Wrapper to avoid nested functions.
const asyncRequire = (imports) => new Promise((res) => {
    require(imports, (...args) => {
        res(args);
    });
});

async function init() {
    const [esriConfig, Map, MapView, Ellipsis] = await asyncRequire(['esri/config', 'esri/Map', 'esri/views/MapView', 'esri/layers/WMSLayer', '../lib/Ellipsis.js']);
    [esriConfig.apiKey] = await asyncRequire(['../../token.js']);

    const map = new Map({
        basemap: "arcgis-topographic" // Basemap layer service
    });

    const view = new MapView({
        map: map,
        center: [-118.805, 34.027], // Longitude, latitude
        zoom: 13, // Zoom level
        container: 'map' // Div element
    });


}
