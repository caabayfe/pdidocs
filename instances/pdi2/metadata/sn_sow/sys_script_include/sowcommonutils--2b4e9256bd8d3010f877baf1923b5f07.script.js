var SOWCommonUtils = Class.create();
SOWCommonUtils.prototype = Object.extendsObject(SOWCommonUtilsSNC, {
    initialize: function() {
		SOWCommonUtilsSNC.prototype.initialize.call(this);
    },

    type: 'SOWCommonUtils'
});
