(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var payload = request.body.data;

    // If there's no payload and no query parameter we can return an error.
    if (global.JSUtil.isEmpty(payload))
        return new sn_ws_err.BadRequestError("No Query String provided");
	
	var aceUtil = new ACEAppBuilderUtilV2();
	var blockName = payload.blockname;
	var blockParameters = payload.blockparams || [];
	var appConfigId = payload.aceconfig;
	var blockId = aceUtil.upsertReusableBlock(blockName, blockParameters, appConfigId);

	response.setBody({blockId: blockId});
	
})(request, response);
