import EllipsisApi from "./EllipsisApi";

//TODO handle captureId and visualizationId.

//This basically is a wrapper around a WMS layer. We can't use a class and extends.
class EllipsisRasterLayer {

    getArcgisJsLayer = () => this.wmsLayer;

    constructor(blockId, captureId, visualizationId, options = {}) {

        if(!EllipsisRasterLayer.WMSLayer) {
            console.error('Please set the wmsLayer import in EllipsisVectorLayer.WMSLayer before using this utility.');
            return;
        }

        const token = options.token;
        const getTokenUrlExtension = () => {
            return token ? `?token=${token}` : '';
        }
        const url = `${EllipsisApi.apiUrl}/wms/${blockId}${getTokenUrlExtension(token)}`;

        this.wmsLayer = new EllipsisRasterLayer.WMSLayer({ url });
    }
}

export default EllipsisRasterLayer;