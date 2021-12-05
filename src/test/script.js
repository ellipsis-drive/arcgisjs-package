//Wrapper to avoid nested functions.
const asyncRequire = (imports) => new Promise((res) => {
    require(imports, (...args) => {
        res(args);
    });
});

async function init() {
    const [esriConfig, Map, MapView, Ellipsis] = await asyncRequire(['esri/config', 'esri/Map', 'esri/views/MapView', '../lib/Ellipsis.js']);
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
    let graphicsLayer = Ellipsis.VectorLayer(
        '1a24a1ee-7f39-4d21-b149-88df5a3b633a',
        '45c47c8a-035e-429a-9ace-2dff1956e8d9',
        { 
            onFeatureClick: (x) => console.log(x),
            loadAll: true
        }
    );

    // map.add(graphicsLayer);



}
