import getEllipsisUtilObject from './getEllipsisUtilObject';

const EllipsisApi = getEllipsisUtilObject('EllipsisApi');


//TODO handle captureId and visualizationId.

//This basically is a wrapper around a WMS layer. We can't use a class and extends.
class EllipsisRasterLayer {

    getArcgisJsLayer = () => this.wmsLayer;

    constructor(options = {}) {

        if (!EllipsisRasterLayer.WMSLayer) {
            console.error('Please set the wmsLayer import in EllipsisVectorLayer.WMSLayer before using this utility.');
            return;
        }

        if (options.visualization || options.visualizationId !== undefined)
            console.warn('visualizations are currently not supported');

        const token = options.token;
        const getTokenUrlExtension = () => {
            return token ? `?token=${token}` : '';
        }
        const url = `${EllipsisApi.getApiUrl()}/wms/${options.blockId}${getTokenUrlExtension(options.token)}`;

        this.wmsLayer = new EllipsisRasterLayer.WMSLayer({ url });
    }
}

export default EllipsisRasterLayer;