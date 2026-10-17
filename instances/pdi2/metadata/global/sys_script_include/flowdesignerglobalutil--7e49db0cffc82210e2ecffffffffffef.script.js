var FlowDesignerGlobalUtil = Class.create();
FlowDesignerGlobalUtil.prototype = {
    initialize: function() {},

    type: 'FlowDesignerGlobalUtil'
};
/**
 * getDecompressedValue - Function to generate the decompressed value from compressed value
 * @param {String} compressedValue - Compressed value
 * @returns {String} - Decompressed value
 */
FlowDesignerGlobalUtil.getDecompressedValue = function(compressedValue) {
    try {
        return GlideCompressionUtil.expandToString(GlideStringUtil.base64DecodeAsBytes(compressedValue));
    } catch (e) {
        gs.error("FlowDesignerGlobalUtil.getDecompressedValue() - Error in decompressing the value: " + e);
    }
    return '';
};
