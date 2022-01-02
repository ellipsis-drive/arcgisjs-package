import { EllipsisVectorLayerBase, GeoJsonUtil } from 'ellipsis-js-util'

class EllipsisVectorLayer {

    getArcgisJsLayer = () => this.graphicsLayer;
    getEllipsisLayer = () => this.ellipsisLayer;

    constructor(options = {}) {

        this.ellipsisLayer = new EllipsisVectorLayerBase(options);
        this.ellipsisLayer.getMapBounds = this.getMapBounds;
        this.ellipsisLayer.updateView = this.updateView;

        //Use this to make the library portable between multiple arcgisjs api versions.
        if (!EllipsisVectorLayer.GraphicsLayer) {
            console.error('[EllipsisVectorLayer] Please set the graphicslayer import in EllipsisVectorLayer.GraphicsLayer before using this utility.');
            return;
        }
        if (!EllipsisVectorLayer.Graphic) {
            console.error('[EllipsisVectorLayer] Please set the graphics import in EllipsisVectorLayer.Graphic before using this utility.');
            return;
        }
        if (!EllipsisVectorLayer.projection) {
            console.error('[EllipsisVectorLayer] Please set the projection import in EllipsisVectorLayer.projection before using this utility.');
            return;
        }
        if (!EllipsisVectorLayer.SpatialReference) {
            console.error('[EllipsisVectorLayer] Please set the SpatialReference class in EllipsisVectorLayer.SpatialReference before using this utility.');
            return;
        }

        EllipsisVectorLayer.projection.load();
        this.spatialReference = new EllipsisVectorLayer.SpatialReference({
            wkid: 4326
        });

        this.graphicsLayer = new EllipsisVectorLayer.GraphicsLayer();
    }

    addTo = (view, index) => {
        this.view = view;
        if (!view.map) return this;
        view.map.add(this.graphicsLayer, index);

        if (this.ellipsisLayer.onFeatureClick) {
            view.on("click", async (e) => {
                const hit = await view.hitTest({ x: e.x, y: e.y });
                if (!hit.results || !hit.results.length) return;
                const graphicHit = hit.results.find(x => x.graphic.layer === this.graphicsLayer);
                const graphic = graphicHit.graphic;
                if (graphic && graphic.id) {
                    const feature = this.ellipsisLayer.getFeatures().find(x => x.properties.id === graphic.id);
                    this.ellipsisLayer.onFeatureClick(feature, graphicHit, e);
                }
            });
        }

        view.when(() => this.ellipsisLayer.update());

        view.watch("stationary", (isStationary) => {
            if (isStationary)
                this.ellipsisLayer.update();
        });

        return this;
    }

    updateView = () => {
        const features = this.ellipsisLayer.getFeatures();
        if (!features.length) return;

        this.graphicsLayer.removeAll();
        this.graphicsLayer.addMany(features.flatMap(x => this.featureToGraphics(x)));
    };

    featureToGraphics = (feature) => {
        const type = feature.geometry.type;
        const properties = feature.properties;
        console.log(properties.color);
        const color = GeoJsonUtil.parseColor(properties.color);
        console.log(color);

        const coordinateArray = type.startsWith('Multi') ? feature.geometry.coordinates : [feature.geometry.coordinates];

        if (type.endsWith('Polygon')) {
            const symbol = {
                type: 'simple-fill',
                color: [color.r, color.g, color.b, color.alpha],
                outline: {
                    color: [color.r, color.g, color.b],
                    width: this.ellipsisLayer.lineWidth
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
        if (type.endsWith('Point')) {
            const symbol = {
                type: 'simple-marker',
                color: [color.a, color.g, color.b, color.alpha],
                size: this.ellipsisLayer.radius,
                outline: {
                    width: this.ellipsisLayer.lineWidth,
                    color: [color.a, color.g, color.b]
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
        if (type.endsWith('Line')) {
            const symbol = {
                type: 'simple-line',
                color: [color.a, color.g, color.b, color.alpha],
                width: this.ellipsisLayer.lineWidth,
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

    getMapBounds = () => {
        const arcgisBounds = EllipsisVectorLayer.projection.project(this.view.extent, this.spatialReference);

        let bounds = {
            xMin: arcgisBounds.xmin,
            xMax: arcgisBounds.xmax,
            yMin: arcgisBounds.ymin,
            yMax: arcgisBounds.ymax,
        };
        return { bounds: bounds, zoom: Math.floor(this.view.zoom) };
    };
}

export default EllipsisVectorLayer;