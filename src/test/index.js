import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import config from "@arcgis/core/config";
import * as projection from '@arcgis/core/geometry/projection';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';

import apiToken from "./token";
import Ellipsis from "../lib/Ellipsis";
import Graphic from '@arcgis/core/Graphic';


config.apiKey = apiToken;

const map = new Map({
    basemap: "arcgis-topographic", // Basemap layer service
});

// document.getElementById('map').onmousedown = () => console.log('hi');

const view = new MapView({
    map: map,
    center: [4.633205849096186, 52.373527706597514], // Longitude, latitude
    zoom: 13, // Zoom level
    container: "map", // Div element
});


// view.whenLayerView(featureLayer).then(function (layerView) {
//     layerView.watch("updating", function (value) {
//         console.log(value);
//     });
// });

// view.on("click", (e) => {
//     console.log(e);
// });

view.watch("scale", (e, f) => {
    console.log("scale chage");
    console.log(e);
});

view.watch("stationary", (e) => {
    console.log(`stationary: ${e}`);
})

// const sr4326 = new SpatialReference({
//     wkid: 4326
// });

// view.watch("stationary", async (e) => {
//     console.log("stationary");
//     console.log(e);

//     await projection.load();
//     const LatLongExtent = projection.project(view.extent, sr4326);
//     // console.log(view.extent);
//     //This includes xmax xmin ymax ymin

//     console.log(`xmax: ${LatLongExtent.xmax}`);

//     if(LatLongExtent)
//         console.log(JSON.stringify(LatLongExtent));
//     else console.log('what happenend');

   

    
//         // console.log(`Erm: ${LatLongExtent.xmin()}`);
    
        
// });

// map.on('load', (map => {
//     console.log('test');
// }));

// setInterval(() => {
//     console.log(view.state);
// }, 2000);

//With worldscreenwidth, center and pixel size we can find out the left and right lng lat
//view.state.viewpoint.targetGeometry.latitude and .longtitude gives center of map

//view.viewpoint.zoom
//view.state

// map.add(Ellipsis.RasterLayer(
//     '2057fd2a-66c5-46ef-9c71-bb8f7a180c44',
//     ''
// ), 0);
const layer = Ellipsis.VectorLayer(view, '1a24a1ee-7f39-4d21-b149-88df5a3b633a','45c47c8a-035e-429a-9ace-2dff1956e8d9', {styleId: 'a30d5d0e-26a3-43a7-9d23-638cef7600c4'});
map.add(layer,1);