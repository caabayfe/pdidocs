var SOWITSMCommonUtils = Class.create();
SOWITSMCommonUtils.prototype = Object.extendsObject(SOWITSMCommonUtilsSNC, {
    initialize: function() {
        SOWITSMCommonUtilsSNC.prototype.initialize.call(this);
    },

    type: 'SOWITSMCommonUtils'
});
