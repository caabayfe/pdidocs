(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    // Enforce capability metadata read authorization before using the DAO-backed read path.
    if (!sn_one_extend.OneExtendUtil.canReadOneExtendMetadata('definition_attribute')) {
        response.setStatus(403);
        response.setBody({ error: 'Access denied: user is not authorized to read One Extend capability metadata' });
        return;
    }

    // Get capabilityId from path param
    var pathParams = request.pathParams;
    var capabilityId = pathParams.capabilityId;

    var capabilityAttributes = sn_one_extend.OneExtendUtil.getCapabilityAttributes(capabilityId);
	response.setBody(capabilityAttributes);

})(request, response);
