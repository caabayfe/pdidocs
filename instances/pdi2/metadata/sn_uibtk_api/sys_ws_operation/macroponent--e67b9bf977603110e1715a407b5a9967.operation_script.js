(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const macroponentSysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
        const parentMacroponentSysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.PARENT_MCP_SYS_ID);
        const includeRelatedRecords = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.INCLUDE_RELATED_RECORDS);
        const deviceMode = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.DEVICE_MODE) ?? BuilderToolkitConstants.ADAPTIVE_VARIANT_MODES.DESKTOP;
        if (includeRelatedRecords === true) {
            const macroponentAndRelatedRecords = new AdaptiveMacroponentVariant().getVariantMacroponentAndRelatedRecords(macroponentSysId, parentMacroponentSysId, deviceMode);
            apiHelper.getResponse(macroponentAndRelatedRecords, BuilderToolkitConstants.ERRORS.NO_RECORD_FOUND);
        } else {
			      const macroponent = new AdaptiveMacroponentVariant().getMacroponent(macroponentSysId, deviceMode);
            apiHelper.getResponse(macroponent, BuilderToolkitConstants.ERRORS.NO_RECORD_FOUND);
        }
    });

})(request, response);
