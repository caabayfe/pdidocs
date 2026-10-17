var SOWITSMCommonClientUtils = Class.create();
SOWITSMCommonClientUtils.prototype = Object.extendsObject(SOWITSMCommonClientUtilsSNC, {
	initialize: function(request, responseXML, gc) {
        SOWITSMCommonClientUtilsSNC.prototype.initialize.call(this, request, responseXML, gc);
    },
	
    type: 'SOWITSMCommonClientUtils'
});
