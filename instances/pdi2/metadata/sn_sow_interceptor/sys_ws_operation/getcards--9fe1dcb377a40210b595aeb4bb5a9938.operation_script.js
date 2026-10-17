(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var appliedTo = request.queryParams.appliedTo || '';
    if (!appliedTo)
        return new sn_ws_err.BadRequestError('appliedTo not provided');

	var referencedField = request.queryParams.referencedField || '';
	var parentSysId = request.queryParams.parentSysId || '';

	return new InterceptorUtils().getRecordTypes(appliedTo, referencedField, parentSysId);

})(request, response);
