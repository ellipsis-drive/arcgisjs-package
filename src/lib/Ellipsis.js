define(['esri/layers/WMSLayer', 'esri/Graphic', 'esri/layers/GraphicsLayer'], (WMSLayer, Graphic, GraphicsLayer) => {
    return {
        Ellipsis: {
            RasterLayer: (blockId, captureId, visualizationId, options = {}) => {
                return new EllipsisRasterLayer(
                    WMSLayer,
                    blockId,
                    captureId,
                    visualizationId,
                    options.token
                );
            },
            VectorLayer: (blockId, layerId, options = {}) => {
                return new EllipsisVectorLayer(
                    Graphic, GraphicsLayer,
                    blockId, layerId,
                    options.onFeatureClick,
                    options.token,
                    options.styleId,
                    options.style,
                    options.filter,
                    options.centerPoints ? true : false,
                    options.maxZoom ? options.maxZoom : 21,
                    options.pageSize ? Math.max(3000, options.pageSize) : 25,
                    options.maxMbPerTile ? options.maxMbPerTile * 1000000 : 16000000,
                    options.maxTilesInCache ? options.maxTilesInCache : 500,
                    options.maxFeaturesPerTile ? options.maxFeaturesPerTile : 200,
                    options.radius ? options.radius : 15,
                    options.lineWidth ? options.lineWidth : 5,
                    options.useMarkers ? true : false,
                    options.loadAll ? true : false
                );
            }
        }
    }
});