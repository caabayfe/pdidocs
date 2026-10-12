(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const baseMacroponentSysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
        const deviceMode = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.DEVICE_MODE) ?? BuilderToolkitConstants.ADAPTIVE_VARIANT_MODES.DESKTOP;

        const adaptiveMacroponentHandler = new AdaptiveMacroponentVariant();
        if (adaptiveMacroponentHandler.isValidVariantDeviceType(deviceMode) && !adaptiveMacroponentHandler.checkIfExisting(baseMacroponentSysId, deviceMode)) {
            const result = adaptiveMacroponentHandler.createAdaptiveVariantMapping(baseMacroponentSysId, deviceMode);
            typeof result === 'string' ? apiHelper.respondSuccesfully({
                result
            }) : apiHelper.respondUnsuccessfully(result);
        } else {
            apiHelper.respondUnsuccessfully(
                `Invalid device type or variant mapping already exists for "${deviceMode}".`
            );
        }
    });
})(request, response);
