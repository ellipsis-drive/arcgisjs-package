### Import the Ellipsis library in an arcgis-js project

You can import this package with npm, requireJS, commonJS and through script tags.

#### npm

```bash
npm install arcgisjs-ellipsis
```

```js
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import * as projection from "@arcgis/core/geometry/projection";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import {
  EllipsisVectorLayer,
  EllipsisRasterLayer,
  EllipsisApi,
} from "arcgisjs-ellipsis";

//Pass the imports of this project to the layers. It's designed this way to ensure
//cross version compatibility.
EllipsisVectorLayer.GraphicsLayer = GraphicsLayer;
EllipsisVectorLayer.Graphic = Graphic;
EllipsisVectorLayer.projection = projection;
EllipsisVectorLayer.SpatialReference = SpatialReference;
EllipsisRasterLayer.WMSLayer = WMSLayer;
```

#### \<script\> tag

```html
<header>
  <script src="https://github.com/ellipsis-drive/ellipsis-js-util/releases/download/1.1.0/ellipsis-js-util-1.1.0.js"></script>
  <script src="https://github.com/ellipsis-drive/arcgisjs-package/releases/download/1.1.0/arcgisjs-ellipsis-1.1.0.js"></script>
</header>

<script>
  //access the library similarly to the NPM imported ones, but with the ellipsis prefix.
  arcgisjsEllipsis.EllipsisVectorLayer;
  arcgisjsEllipsis.EllipsisRasterLayer;
  arcgisjsEllipsis.EllipsisApi;

  //Please not that you also have to pass all necessary arcgisjs imports as shown
  //in the npm example.
</script>
```

#### RequireJS

```js
require([['esri/layers/GraphicsLayer', 'esri/Graphic', 'esri/projection',
'esri/SpatialReference','esri/layers/WMSLayer', 'https://github.com/ellipsis-drive/ellipsis-js-util/releases/download/1.1.0/ellipsis-js-util-1.1.0.js','https://github.com/ellipsis-drive/arcgisjs-package/releases/download/1.1.0/arcgisjs-ellipsis-1.1.0.js'],
(GraphicsLayer, Graphic, projection, SpatialReference, WMSLayer, EllipsisUtil, arcgisjsEllipsis) => {

    window.EllipsisUtil = EllipsisUtil;

    //Pass all imports..
    arcgisjsEllipsis.EllipsisVectorLayer.GraphicsLayer = GraphicsLayer;
    arcgisjsEllipsis.EllipsisVectorLayer.Graphic = Graphic;
    arcgisjsEllipsis.EllipsisVectorLayer.projection = projection;
    arcgisjsEllipsis.EllipsisVectorLayer.SpatialReference = SpatialReference;
    arcgisjsEllipsis.EllipsisRasterLayer.WMSLayer = WMSLayer;

    //Use the layers to easily import ellipsis drive layers!
})


```

### Add an Ellipsis Drive block to an ArcgisJS map view

#### Example

```js
import Map from "@arcgis/core/Map";
import MapView from "@arcgis/core/views/MapView";
import WMSLayer from "@arcgis/core/layers/WMSLayer";
import GraphicsLayer from "@arcgis/core/layers/GraphicsLayer";
import Graphic from "@arcgis/core/Graphic";
import SpatialReference from "@arcgis/core/geometry/SpatialReference";
import config from "@arcgis/core/config";
import apiToken from "./token";
import * as projection from "@arcgis/core/geometry/projection";

import { EllipsisVectorLayer, EllipsisRasterLayer } from "arcgisjs-ellipsis";

EllipsisVectorLayer.GraphicsLayer = GraphicsLayer;
EllipsisVectorLayer.Graphic = Graphic;
EllipsisVectorLayer.projection = projection;
EllipsisVectorLayer.SpatialReference = SpatialReference;
EllipsisRasterLayer.WMSLayer = WMSLayer;

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

const borders = new EllipsisVectorLayer({
  pathId: "1a24a1ee-7f39-4d21-b149-88df5a3b633a",
  timestampId: "45c47c8a-035e-429a-9ace-2dff1956e8d9",
  style: "a30d5d0e-26a3-43a7-9d23-638cef7600c4"
});
borders.addTo(map);

const vaccinationSites = new EllipsisVectorLayer({
  pathId: "e5b01bac-8c1a-4feb-98e7-c2ff751ef110",
  timestampId: "c8594627-c5eb-4937-992a-b7dcf7046fc1",
  style: "df7522fe-e8eb-4393-80c5-2d5c6d0ea1a8"
});
vaccinationSites.addTo(map);

const vulcano = new EllipsisRasterLayer(
  pathId: "01104b4f-85a7-482c-9ada-11dbce171982",
  timestampId: 0,
  style: "01f63a0d-3f92-42d3-925d-b3bfaf6dd6a1"
);
map.add(vulcano.getArcgisJsLayer(), 2);
```

#### EllipsisRasterLayer methods and fields

1. Call `getArcgisjsLayer()` to get the arcgisjs layer that is generated
2. Set `EllipsisRasterLayer.WMSLayer` to the imported WMSLayer class from the arcgisjs api before using this utility

#### EllipsisRasterLayer options

| Name        | Description                                |
| ----------- | ------------------------------------------ |
| pathId      | id of the path                             |
| timestampId | id of the timestamp                        |
| style      | id of the style or an object describing it |
| maxZoom     | maxZoomlevel of the layer. Default 21.     |
| token       | token of the user                          |

_note_ The visualizations are currently not working as this is a wrapper around a WMS service. This'll possibly still be added.

#### EllipsisVectorLayer methods and fields

1. Call `getArcgisjsLayer()` to get the arcgisjs layer that is generated
2. Set the following fields to their corresponding import from the arcgisjs library.
   - `EllipsisVectorLayer.GraphicsLayer`,
   - `EllipsisVectorLayer.Graphic`,
   - `EllipsisVectorLayer.projection`,
   - `EllipsisVectorLayer.SpatialReference`

#### VectorLayer options

| Name                     | Description                                                              |
| ------------------------ | ------------------------------------------------------------------------ |
| view                     | view that you want to add the map to (used for events and bounds)        |
| pathId                   | Id of the path                                                           |
| timestampId                  | Id of the timestamp                                                          |
| style      | id of the style or an object describing it |
| onFeatureClick           | A function to run on feature click, with as argument the clicked feature |
| token                    | Token of the user                                                        |
| filter                   | A property filter to use                                                 |
| maxZoom                  | maxZoomlevel of the layer. Default 21.                                   |
| centerPoints             | Boolean whether to render only center points. Default false.             |
| pageSize                 | Size to retreive per step. Default 25, max 3000.                         |
| maxMbPerTile             | The maximum mb to load per tile. Default 16mb.                           |
| maxTilesInCache          | The number of tiles to keep in cache. Default 500.                       |
| maxFeaturesPerTile       | The maximum number of features to load per tile. Default 200.            |
| useMarkers (coming soon) | Use markers instead of points. Default false.                            |
| loadAll                  | Always load all vectors, even if not visible or far away. Default false  |
| fetchInterval            | The interval in ms between starting and finishing a request. Default 0   |

_warning_ `loadAll=true` will ignore maxMbPerTile, maxTilesInCache and maxFeaturesPerTile settings.

_onFeatureClick_ gets passed three parameters: (1) the geojson of the feature, (2) the clicked point on the layer and (3) the click event.

_note_ for the style object, refer to this documentation about it: https://app.ellipsis-drive.com/developer/javascript/documentation#POST%20geometryLayers%2FaddStyle.

<details>
<summary>Or this copied info</summary>
○ 'rules': Parameters contains the property 'rules' being an array of objects with required properties 'property', 'value' and 'color' and optional properties 'operator' and 'alpha'. 'property' should be the name of the property to style by and should be of type string, 'value' should be the cutoff point of the style and must be the same type as the property, 'color' is the color of the style and must be a rgb hex code, 'operator'determines whether the styling should occur at, under or over the cutoff point and must be one of '=', '<', '>', '<=', '>=' or '!=' with default '=' and 'alpha' should be the transparency of the color on a 0 to 1 scale with default 0.5.

○ 'rangeToColor': Parameters contains the required property 'rangeToColor' and optional property 'periodic', where 'rangeToColor' should be an array of objects with required properties 'property', 'fromValue', 'toValue' and 'color' and optional property 'alpha', where 'property' should be the name of the property to style by and should be of type string, 'fromValue' and 'toValue' should be the minimum and maximum value of the range respectively, 'color' is the color to use if the property falls inclusively between the fromValue and toValue and should be a rgb hex code color and 'alpha' should be the transparency of the color on a 0 to 1 scale with default 0.5. 'periodic' should be a positive float used when the remainder from dividing the value of the property by the periodic should be used to evaluate the ranges instead.

○ 'transitionPoints': Parameters contains the required properties 'property' and 'transitionPoints' and optional property 'periodic', where 'property' should be the name of the property to style by and should be of type string, 'transitionPoints' should be an array of objects with required properties 'value' and 'color' and optional property 'alpha', where 'value' should be the value at which the next transition starts, 'color' is the color to use if the property falls in the interval before or after the transition point and should be a rgb hex code color and 'alpha' should be the transparency of the color on a 0 to 1 scale with 0.5 as default. 'periodic' should be a positive float used when the remainder from dividing the value of the property by the periodic should be used to evaluate the ranges instead.

○ 'random': Parameters contains the required property 'property' and optional property 'alpha', where 'property' should be the name of the property by which to randomly assign colors and should be of type string and 'alpha' should be the transparency of the color on a 0 to 1 scale with default 0.5.

</details>

### Use the EllipsisApi to login or view metadata

#### EllipsisApi.login description

**parameters**
| name | description |
| -- | -- |
| username | The username of your ellipsis-drive account |
| password | The password of your ellipsis-drive account |
| validFor | (Optional) The number of second the access token will be valid for. Default 86400 (24 hours). |

**return value**

```ts
token: string; //token to use in other api calls
expires: number; //expiration time in milliseconds
```

#### EllipsisApi.getPath description

**parameters**
| name | description |
| -- | -- |
| pathId | The id of the path. |
| user | (Optional) An user object which can contain a token like `user: {token: mytoken}` |

**return value**
It returns JSON, which depends on the type of the specified object.
