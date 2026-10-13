(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    try {
        var evtMgmtAlertTagsUtil = new global.EvtMgmtAlertTagsUtil();
        var tagList = evtMgmtAlertTagsUtil.getAlertTags();
        
		return {
            "tags": tagList
        };
    } catch (e) {
        var errorMessage = "EvtMgmtAlertTagsUtil.getAlertTags() : Failed to retrieve alert tags for current domain.\n Error message:" +
            new global.EvtMgmtCommons().getExceptionMessage(e, true);
        gs.error(errorMessage);
        return {
            "tags": []
        };
    }

})(request, response);
