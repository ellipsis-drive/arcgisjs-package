import EllipsisApi from "./EllipsisApi";

class EllipsisVectorLayer {

    getArcgisJsLayer = () => this.graphicsLayer;
    destroy = () => {
        if(this.gettingVectorsInterval)
            clearInterval(this.gettingVectorsInterval);
    }

    constructor(view, blockId, layerId, options = {}) {

        //Use this to make the library portable between multiple arcgisjs api versions.
        if(!EllipsisVectorLayer.GraphicsLayer) {
            console.error('[EllipsisVectorLayer] Please set the graphicslayer import in EllipsisVectorLayer.GraphicsLayer before using this utility.');
            return;
        }
        if(!EllipsisVectorLayer.Graphic) {
            console.error('[EllipsisVectorLayer] Please set the graphics import in EllipsisVectorLayer.Graphic before using this utility.');
            return;
        }
        if(!EllipsisVectorLayer.projection) {
            console.error('[EllipsisVectorLayer] Please set the projection import in EllipsisVectorLayer.projection before using this utility.');
            return;
        }
        if(!EllipsisVectorLayer.SpatialReference) {
            console.error('[EllipsisVectorLayer] Please set the SpatialReference class in EllipsisVectorLayer.SpatialReference before using this utility.');
            return;
        }

        //When peers use different versions of the arcgisjs api, errors occur. Solved by just passing the imports.
        this.graphicsLayer = new EllipsisVectorLayer.GraphicsLayer();

        Object.keys(EllipsisVectorLayer.defaultOptions).forEach(x => {
            if (options[x] == undefined)
                options[x] = EllipsisVectorLayer.defaultOptions[x];
        });
        Object.keys(EllipsisVectorLayer.optionModifiers).forEach(x => {
            options[x] = EllipsisVectorLayer.optionModifiers[x](options[x]);
        });
        //Copy options to this context. TODO find out or ask if this can be harmful. TODO best to wrap everything in options object anyways.
        Object.keys(options).forEach(x => {
            //Make sure the user can't overwrite anything by accident.
            // if(this[x] === undefined) 
            //     this[x] = options[x];
            this[x] = options[x];
        });

        this.id = `${blockId}_${layerId}`;
        this.blockId = blockId;
        this.layerId = layerId;
        this.tiles = [];
        this.cache = [];

        this.zoom = 1;
        this.changed = false;

        this.view = view;

        //We cannot use GeoJsonLayer because it only accepts one geometry type.
        // this.graphicsLayer = new GraphicsLayer();

        this.latLngNotationType = new EllipsisVectorLayer.SpatialReference({
            wkid: 4326
        });

        //Handle panning of the map
        view.watch("stationary", (isStationary) => {
            // if(!isStationary && !this.viewportCheckingInterval) {
            //     this.handleViewportUpdate();
            //     this.viewportCheckingInterval = setInterval(() => {
            //         this.handleViewportUpdate();
            //     }, 1000);
            // } else if(isStationary) {
            //     this.handleViewportUpdate();
            //     if(this.viewportCheckingInterval) {
            //         clearInterval(this.viewportCheckingInterval);
            //         this.viewportCheckingInterval = undefined;
            //     }
            // }
            if(isStationary) this.handleViewportUpdate();
        });

        //Handle feature clicks
        if(this.onFeatureClick) {
            view.on("click", async (e) => {
                const hit = await view.hitTest({x: e.x, y: e.y});
                if(!hit.results || !hit.results.length) return;
                const graphicHit = hit.results.find(x => x.graphic.layer === this.graphicsLayer);
                const graphic = graphicHit.graphic;
                if(graphic && graphic.id) {
                    let feature;
                    if (this.loadAll) {
                        feature = this.cache.find(x => x.properties.id === graphic.id);
                    } else {
                        feature = this.tiles.flatMap((t) => {
                            const geoTile = this.cache[this.getTileId(t)];
                            return geoTile ? geoTile.elements : [];
                        }).find(x => x.properties.id === graphic.id);
                    }
                    this.onFeatureClick(feature, graphicHit, e);
                }
            });
        }
        EllipsisVectorLayer.projection.load().then(this.handleViewportUpdate());
    }

    handleViewportUpdate = async () => {
        const viewport = await this.getMapBounds();
        if (!viewport) return;
        this.zoom = Math.max(Math.min(this.maxZoom, viewport.zoom - 2), 0);
        this.tiles = this.boundsToTiles(viewport.bounds, this.zoom);
        if (this.gettingVectorsInterval) return;
        this.gettingVectorsInterval = setInterval(async () => {
            if (this.isLoading) return;

            const loadedSomething = await this.loadStep();
            if (!loadedSomething) {
                clearInterval(this.gettingVectorsInterval);
                this.gettingVectorsInterval = undefined;
                return;
            }
            this.updateView();
        }, 100);
    };

    updateView = () => {
        if (!this.tiles || this.tiles.length === 0) return;

        let features;
        if (this.loadAll) {
            features = this.cache;
        } else {
            features = this.tiles.flatMap((t) => {
                const geoTile = this.cache[this.getTileId(t)];
                return geoTile ? geoTile.elements : [];
            });
        }

        if(!features.length) return;        
        
        this.graphicsLayer.removeAll();
        this.graphicsLayer.addMany(features.flatMap(x => this.featureToGraphics(x)));        
    };

    featureToGraphics = (feature) => {
        const type = feature.geometry.type;
        const properties = feature.properties;
        const color = properties.color;

        let r = 1, g = 1, b = 1, a = 0.25; //default to black, with 25% opacity
        if(color) {
            const splitHexComponents = /^#([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})?$/i.exec(color);
            if(!splitHexComponents) return;
            [r,g,b,a] = splitHexComponents.slice(1).map(x => parseInt(x, 16));
            a = isNaN(a) ? a = 0.5 : a /= 255;
            if(isNaN(a)) a = 0.25;
        }
        const coordinateArray = type.startsWith('Multi') ? feature.geometry.coordinates : [feature.geometry.coordinates];

        if(type.endsWith('Polygon')) {
            const symbol = {
                type: 'simple-fill',
                color: [r, g, b, a],
                outline: {
                    color: [r, g, b],
                    width: this.lineWidth
                }
            }
            //Multipolygons need to be added as seperate shapes
            return coordinateArray.map(path => new EllipsisVectorLayer.Graphic({
                id: feature.properties.id,
                symbol,
                geometry: {
                    type: 'polygon',
                    rings: path,
                }
            }));
        }
        if(type.endsWith('Point')) {
            const symbol = {
                type: 'simple-marker',
                color: [r, g, b, a],
                size: this.radius,
                outline: {
                    width: this.lineWidth,
                    color: [r, g, b]
                }
            }
            return coordinateArray.map(point => new EllipsisVectorLayer.Graphic({
                id: feature.properties.id,
                symbol,
                geometry: {
                    type: 'point',
                    longitude: point[0],
                    latitude: point[1],
                }
            }));
        }
        if(type.endsWith('Line')) {
            const symbol = {
                type: 'simple-line',
                color: [r, g, b, a],
                width: this.lineWidth,
            }
            return coordinateArray.map(path => new EllipsisVectorLayer.Graphic({
                id: feature.properties.id,
                symbol,
                geometry: {
                    type: 'polyline',
                    paths: path,
                }
            }));
        }
    }

    loadStep = async () => {
        this.isLoading = true;
        if (this.loadAll) {
            const cachedSomething = await this.getAndCacheAllGeoJsons();
            this.isLoading = false;
            return cachedSomething;
        }

        this.ensureMaxCacheSize();
        const cachedSomething = await this.getAndCacheGeoJsons();
        this.isLoading = false;
        return cachedSomething;
    };

    ensureMaxCacheSize = () => {
        const keys = Object.keys(this.cache);
        if (keys.length > this.maxTilesInCache) {
            const dates = keys.map((k) => this.cache[k].date).sort();
            const clipValue = dates[9];
            keys.forEach((key) => {
                if (this.cache[key].date <= clipValue) {
                    delete this.cache[key];
                }
            });
        }
    };

    getAndCacheAllGeoJsons = async () => {
        if (this.nextPageStart === 4)
            return false;
        
        const body = {
            pageStart: this.nextPageStart,
            mapId: this.blockId,
            returnType: this.centerPoints ? "center" : "geometry",
            layerId: this.layerId,
            zip: true,
            pageSize: Math.min(3000, this.pageSize),
            styleId: this.styleId,
            style: this.style
        };

        try {
            const res = await EllipsisApi.post("/geometry/get", body, { token: this.token });
            this.nextPageStart = res.nextPageStart;
            if (!res.nextPageStart)
                this.nextPageStart = 4; //EOT (end of transmission)
            if (res.result && res.result.features) {
                res.result.features.forEach(x => {
                    this.cache.push(x);
                });
            }
        } catch {
            return false;
        }
        return true;
    }

    getAndCacheGeoJsons = async () => {
        const date = Date.now();
        //create tiles parameter which contains tiles that need to load more features
        const tiles = this.tiles.map((t) => {
            const tileId = this.getTileId(t);

            //If not cached, always try to load features.
            if (!this.cache[tileId])
                return { tileId: t }

            const pageStart = this.cache[tileId].nextPageStart;


            //Check if tile is not already fully loaded, and if more features may be loaded
            if (pageStart && this.cache[tileId].amount <= this.maxFeaturesPerTile && this.cache[tileId].size <= this.maxMbPerTile)
                return { tileId: t, pageStart }
            
            return null;
        }).filter(x => x);

        if (tiles.length === 0) return false;

        const body = {
            mapId: this.blockId,
            returnType: this.centerPoints ? "center" : "geometry",
            layerId: this.layerId,
            zip: true,
            pageSize: this.pageSize,
            styleId: this.styleId,
            style: this.style,
            propertyFilter: (this.filter && this.filter > 0) ? this.filter : null,
        };


        //Get new geometry for the tiles
        let result = [];
        const chunkSize = 10;
        for (let k = 0; k < tiles.length; k += chunkSize) {
            body.tiles = tiles.slice(k, k + chunkSize);
            try {
                const res = await EllipsisApi.post("/geometry/tile", body, { token: this.token });
                result = result.concat(res);
            } catch {
                return false;
            }
        }

        //Add newly loaded data to cache
        for (let j = 0; j < tiles.length; j++) {
            const tileId = this.getTileId(tiles[j].tileId);

            if (!this.cache[tileId]) {
                this.cache[tileId] = {
                    size: 0,
                    amount: 0,
                    elements: [],
                    nextPageStart: null,
                };
            }

            //set tile info for tile in this.
            const tileData = this.cache[tileId];
            tileData.date = date;
            tileData.size = tileData.size + result[j].size;
            tileData.amount = tileData.amount + result[j].result.features.length;
            tileData.nextPageStart = result[j].nextPageStart;
            tileData.elements = tileData.elements.concat(result[j].result.features);

        }
        return true;
    };

    getTileId = (tile) => `${tile.zoom}_${tile.tileX}_${tile.tileY}`;

    boundsToTiles = (bounds, zoom) => {
        const xMin = Math.max(bounds.xMin, -180);
        const xMax = Math.min(bounds.xMax, 180);
        const yMin = Math.max(bounds.yMin, -85);
        const yMax = Math.min(bounds.yMax, 85);

        const zoomComp = Math.pow(2, zoom);
        const comp1 = zoomComp / 360;
        const pi = Math.PI;
        const comp2 = 2 * pi;
        const comp3 = pi / 4;

        const tileXMin = Math.floor((xMin + 180) * comp1);
        const tileXMax = Math.floor((xMax + 180) * comp1);
        const tileYMin = Math.floor(
            (zoomComp / comp2) *
            (pi - Math.log(Math.tan(comp3 + (yMax / 360) * pi)))
        );
        const tileYMax = Math.floor(
            (zoomComp / comp2) *
            (pi - Math.log(Math.tan(comp3 + (yMin / 360) * pi)))
        );

        let tiles = [];
        for (
            let x = Math.max(0, tileXMin - 1);
            x <= Math.min(2 ** zoom - 1, tileXMax + 1);
            x++
        ) {
            for (
                let y = Math.max(0, tileYMin - 1);
                y <= Math.min(2 ** zoom - 1, tileYMax + 1);
                y++
            ) {
                tiles.push({ zoom, tileX: x, tileY: y });
            }
        }
        return tiles;
    };

    getMapBounds = () => {
        if(!EllipsisVectorLayer.projection.isLoaded()) return undefined;

        const arcgisBounds = EllipsisVectorLayer.projection.project(this.view.extent, this.latLngNotationType);

        let bounds = {
            xMin: arcgisBounds.xmin,
            xMax: arcgisBounds.xmax,
            yMin: arcgisBounds.ymin,
            yMax: arcgisBounds.ymax,
        };

        return { bounds: bounds, zoom: Math.floor(this.view.zoom/this.refreshTilesStep)*this.refreshTilesStep};
    };

}

//React-style defaults to allow easy porting.
EllipsisVectorLayer.defaultOptions = {
    centerPoints: false,
    maxZoom: 21,
    pageSize: 25,
    maxMbPerTile: 16,
    maxTilesInCache: 500,
    maxFeaturesPerTile: 500,
    radius: 6,
    lineWidth: 2, //TODO also change in readme
    useMarkers: false,
    loadAll: false,
    refreshTilesStep: 1,
};

EllipsisVectorLayer.optionModifiers = {
    pageSize: (pageSize) => Math.min(3000, pageSize),
    maxMbPerTile: (maxMbPerTile) => maxMbPerTile * 1000000
}; 

export default EllipsisVectorLayer;