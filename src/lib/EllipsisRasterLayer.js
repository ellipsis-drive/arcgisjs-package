import WMSLayer from '@arcgis/core/layers/WMSLayer';
import EllipsisApi from "./EllipsisApi";

//TODO handle captureId and visualizationId.

//This basically is a wrapper around a WMS layer. We can't use a class and extends.
const EllipsisRasterLayer = (blockId, captureId, visualizationId, options = {}) => {
    const token = options.token;
    const getTokenUrlExtension = () => {
        return token ? `?token=${token}` : '';
    }
    const url = `${EllipsisApi.apiUrl}/wms/${blockId}${getTokenUrlExtension(token)}`;

    return new WMSLayer({ url });
};

export default EllipsisRasterLayer;