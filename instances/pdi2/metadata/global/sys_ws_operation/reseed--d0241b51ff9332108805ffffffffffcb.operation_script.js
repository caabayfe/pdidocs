(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var responseBody = {};
	var sysId = request.pathParams.sys_id;
    // Check if sysId is sent
    if (!sysId) {
		responseBody.error = "Missing capability sys_id";
        response.setStatus(400);
        response.setBody(responseBody);
        return;
    }

	var requestBody = request.body || null;
	var requestBodyData = (requestBody && requestBody.dataString) || "";

	// Retrieve JWT
	var glideJWT = null;
	if (!requestBody || !requestBodyData) {
		response.setStatus(400);
		responseBody.error = "Missing request body";
		response.setBody(responseBody);
		return;
	}
	var requestPayload = JSON.parse(requestBodyData);
	glideJWT = requestPayload["Glide-JWT"];
    // Check if JWT is sent
    if (!glideJWT) {
        response.setStatus(400);
		responseBody.error = "Missing JWT";
        response.setBody(responseBody);
        return;
    }

	// Validate JWT
    var validationResponse = sn_one_extend.GenerativeAIUtility.validateJWT(glideJWT);
    if (!validationResponse || !validationResponse.valid) {
        response.setStatus(401);
		responseBody.error = "Authorization failed - Invalid JWT";
        response.setBody(responseBody);
        return;
    }

	// Check if capability exists
	var capabilityGr = new GlideRecord("sys_one_extend_capability");
	capabilityGr.addQuery("sys_id", sysId);
	capabilityGr.addQuery("active", "true");
	capabilityGr.query();
	if (!capabilityGr.next()) {
		response.setStatus(400);
		responseBody.error = "Invalid capabilityId";
        response.setBody(responseBody);
        return;
	}

	// logging in case capability is not offglide enabled metadata is still being reseeded
	var isOffGlideEnabled = capabilityGr.getValue("offglide_enabled");
	if (isOffGlideEnabled == 0) {
		gs.warn("Capability {0} is not supported offglide. Value for offglide_enabled column is {1}", sysId, isOffGlideEnabled);
	}

	// Route based on reseedType: DELTA triggers synchronous delta reseed, default triggers full rebuild
	var reseedType = requestPayload["reseedType"] || null;
	if (reseedType === "DELTA") {
		try {
			sn_one_extend.GenerativeAIUtility.triggerMosaicDeltaReseed(sysId);
			// reseedMode in response lets Mosaic distinguish new Glide (synchronous DELTA) from
			// old Glide (fire-and-forget, no reseedMode field). Used for observability and adaptive behavior.
			responseBody.reseedMode = "DELTA";
			response.setStatus(200);
			response.setBody(responseBody);
		} catch (e) {
			responseBody.error = "Delta reseed failed: " + e.message;
			response.setStatus(500);
			response.setBody(responseBody);
		}
	} else {
		sn_one_extend.GenerativeAIUtility.triggerMosaicMetadataRebuild(sysId);
		response.setStatus(200);
	}

})(request, response);
