import EllipsisRasterLayer from "./EllipsisRasterLayer";
import EllipsisVectorLayer from "./EllipsisVectorLayer";

export default {
    RasterLayer: EllipsisRasterLayer,

    //use parasitic inheritance because we cannot extend the requireJS GraphicsLayer, and because we have to maintain a paired state
    VectorLayer: (...args) => new EllipsisVectorLayer(...args).graphicsLayer
};