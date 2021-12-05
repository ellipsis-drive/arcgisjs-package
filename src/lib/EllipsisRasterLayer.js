class EllipsisRasterLayer {
    constructor(WMSLayer, blockId, captureId, visualizationId, token) {
        let url = `${EllipsisApi.apiUrl}/wms/${blockId}/${captureId}/${visualizationId}`;
        if (token) {
            url += '?token=' + token;
        }

        WMSLayer.call(this, {
            url: `https://api.ellipsis-drive.com/v1/wms/${blockId}`
        });
    }
}