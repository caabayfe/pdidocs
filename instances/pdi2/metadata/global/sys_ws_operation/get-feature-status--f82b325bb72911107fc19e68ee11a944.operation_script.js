(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var resultObj = {
        isMessagePreviewEnabled: false,
        isProactiveTriggersEnabled: false,
        isAMBEnabledInternal: false,
        isAMBEnabledExternal: false,
		fetchUnreadInterval: parseInt(gs.getProperty('com.glide.cs.web_client.fetchUnreadInterval'), 10) || 10000
    };
    try {
        resultObj.isProactiveTriggersEnabled = new sn_pt.ProactiveTriggerAPIGateway().isFeatureEnabled(); // This is kept due to upgrade scenario
        try {
            var returnedObject = new sn_pt.ProactiveTriggerAPIGateway().getFeatureStatusV2();
            if (returnedObject != null && returnedObject != undefined) {
                resultObj.isProactiveTriggersEnabled = returnedObject.isProactiveTriggersEnabled;
                resultObj.isAMBEnabledInternal = returnedObject.isAMBEnabledInternal;
                resultObj.isAMBEnabledExternal = returnedObject.isAMBEnabledExternal;
            }
        } catch (e) {
            gs.info('Proactive Triggers needs to be updated to enable additional features');
        }
    } catch (e) {
        gs.info('Proactive Trigger is not installed');
    }

    resultObj.isMessagePreviewEnabled = gs.getProperty('com.glide.cs.settings.show_message_preview', 'true') === 'true';
    return resultObj;

})(request, response);
