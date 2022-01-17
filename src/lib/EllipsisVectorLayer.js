import { VectorLayerUtil } from 'ellipsis-js-util'

class EllipsisVectorLayer extends VectorLayerUtil.EllipsisVectorLayerBase {

    getArcgisJsLayer = () => this.graphicsLayer;
    getEllipsisLayer = () => this.ellipsisLayer;

    loadOptions = {
        onEachFeature: (feature) => {
            //set RGB values in compiled style
            if (!feature.properties || !feature.properties.compiledStyle) return;
            const compiledStyle = feature.properties.compiledStyle;
            compiledStyle.fillColorRGB = this.getRGB(compiledStyle.fillColor);
            compiledStyle.borderColorRGB = this.getRGB(compiledStyle.borderColor);
        }
    }

    constructor(options = {}) {
        super(options);

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

        if (this.options.onFeatureClick)
            view.on("click", this.handleClickEvent);

        view.when(() => this.update());

        view.watch("stationary", (isStationary) => {
            if (isStationary)
                this.update();
        });

        return this;
    }

    handleClickEvent = async (e) => {
        const hit = await view.hitTest({ x: e.x, y: e.y });
        if (!hit.results || !hit.results.length) return;
        const graphicHit = hit.results.find(x => x.graphic.layer === this.graphicsLayer);
        const graphic = graphicHit.graphic;
        if (graphic && graphic.id) {
            const feature = this.getFeatures().find(x => x.properties.id === graphic.id);
            this.options.onFeatureClick(feature, graphicHit, e);
        }
    }

    updateView = () => {
        const features = this.getFeatures();
        if (!features.length) return;
        this.graphicsLayer.removeAll();
        this.graphicsLayer.addMany(features.flatMap(x => this.featureToGraphics(x)));
    };

    featureToGraphics = (feature) => {
        const type = feature.geometry.type;
        const properties = feature.properties;
        const compiledStyle = properties.compiledStyle;
        if (!compiledStyle)
            console.warn(`no compiled style found on feature ${feature.id}`);

        const coordinateArray = type.startsWith('Multi') ? feature.geometry.coordinates : [feature.geometry.coordinates];

        if (type.endsWith('Polygon')) {
            const symbol = {
                type: 'simple-fill',
                color: [...compiledStyle.fillColorRGB, compiledStyle.fillOpacity],
                outline: {
                    color: [...compiledStyle.borderColorRGB, compiledStyle.borderOpacity],
                    width: compiledStyle.width
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
                color: [...compiledStyle.fillColorRGB, compiledStyle.fillOpacity],
                size: compiledStyle.radius,
                outline: {
                    width: compiledStyle.width,
                    color: [...compiledStyle.borderColorRGB, compiledStyle.borderOpacity]
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
                color: [...compiledStyle.borderColorRGB, 1 - compiledStyle.borderOpacity],
                width: compiledStyle.width,
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
    };

    getRGB = (color) => {
        if (!color || color.length < 7) return [];
        const r = parseInt(color.substr(1, 2), 16);
        const g = parseInt(color.substr(3, 2), 16);
        const b = parseInt(color.substr(5, 2), 16);
        return [r, g, b];
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