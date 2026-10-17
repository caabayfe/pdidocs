(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    const adaptiveMacroponentHandler = new AdaptiveMacroponentVariant();
    const apiHelper = new APIHelper(request, response);
    apiHelper.execute(function() {
        const sysId = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.SYS_ID);
        const device = apiHelper.getQueryParam(BuilderToolkitConstants.QUERY_PARAM.DEVICE_MODE) ?? null;

        if (!sysId || !adaptiveMacroponentHandler.isValidDeviceType(device)) {
            apiHelper.respondUnsuccessfully('Bad Request: Missing or invalid params!');
			      return;
        }
        if (!adaptiveMacroponentHandler.checkIfExisting(sysId, device)) {
            apiHelper.respondUnsuccessfully(`Adaptive variant for device '${device}' doesn't exist!`);
			      return;
        }
        adaptiveMacroponentHandler.deleteVariantByDevice(sysId, device);
        apiHelper.respondSuccesfully({
          device,
          sysId
        });
    });

})(request, response);
