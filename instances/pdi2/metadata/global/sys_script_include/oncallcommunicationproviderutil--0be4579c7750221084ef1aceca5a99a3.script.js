var OnCallCommunicationProviderUtil = Class.create();
OnCallCommunicationProviderUtil.prototype = {

    initialize: function() {},

    callProcessResponse: function(type, sourceGr, response, extraParams) {
        var eps = new GlideScriptedExtensionPoint().getExtensions(new OnCallConstants().EXTENSION_POINT.ON_CALL_COMMUNICATION_PROVIDER);
        var output = {};

        for (var j = 0; j < eps.length; j++) {
            var commType = eps[j].getCommType();
            if (commType == type) {
                output = eps[j].processResponse(sourceGr, response, extraParams);
                break;
            }
        }

        return output;
    },

    type: 'OnCallCommunicationProviderUtil'
};
