(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var viewConfigSysId = request.pathParams.viewConfigSysId;
	var viewTemplateSysId = request.queryParams.viewTemplateSysId;
	var viewConfigMetadata = new sn_mobile_card_bui.ViewConfigMetadata(viewConfigSysId);
	return viewConfigMetadata.getElementAttributeFieldMetadata(viewTemplateSysId);
})(request, response);
