import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import config from "@arcgis/core/config";
import GraphicsLayer from '@arcgis/core/layers/GraphicsLayer';
import WMSLayer from '@arcgis/core/layers/WMSLayer';
import * as projection from '@arcgis/core/geometry/projection';
import SpatialReference from '@arcgis/core/geometry/SpatialReference';
import apiToken from "./token";
import Graphic from '@arcgis/core/Graphic';

import {EllipsisRasterLayer, EllipsisVectorLayer, EllipsisApi} from '../lib';


config.apiKey = apiToken;

const map = new Map({
    basemap: "arcgis-topographic", // Basemap layer service
});

const view = new MapView({
    map: map,
    center: [4.633205849096186, 52.373527706597514], // Longitude, latitude
    zoom: 13, // Zoom level
    container: "map", // Div element
});

EllipsisVectorLayer.GraphicsLayer = GraphicsLayer;
EllipsisVectorLayer.Graphic = Graphic;
EllipsisVectorLayer.projection = projection;
EllipsisVectorLayer.SpatialReference = SpatialReference;

const layer = new EllipsisVectorLayer(view, '1a24a1ee-7f39-4d21-b149-88df5a3b633a','45c47c8a-035e-429a-9ace-2dff1956e8d9', {styleId: 'a30d5d0e-26a3-43a7-9d23-638cef7600c4'}).getArcgisJsLayer();
map.add(layer,1);
const vaccinationSites = new EllipsisVectorLayer(view, 'e5b01bac-8c1a-4feb-98e7-c2ff751ef110', 'c8594627-c5eb-4937-992a-b7dcf7046fc1', {styleId: 'df7522fe-e8eb-4393-80c5-2d5c6d0ea1a8'}).getArcgisJsLayer();
map.add(vaccinationSites, 2);