(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var pathParams = request.pathParams;

    if (!pathParams.change_template_id)
        return new sn_ws_err.BadRequestError("Change Template id not provided");

    var chgModelTemplateSysId = pathParams.change_template_id + "";
    if (!chgModelTemplateSysId)
        return new sn_ws_err.BadRequestError("Change Template id not provided");

    var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams, request.body.data);
    var state;
    if (nameValuePairs.state) {
        state = nameValuePairs.state;
        delete nameValuePairs.state;
    }

    var changeRequest = global.ChangeRequest.newTemplatedChange(chgModelTemplateSysId, nameValuePairs);
    if (!changeRequest)
        return new sn_ws_err.BadRequestError("Failed to create change with change template: " + chgModelTemplateSysId);

    if ((!state && changeRequest.insert()) || (state && changeRequest.moveTo(state) && changeRequest.insert())) {
        var result = changeRequest.toJS();
        result.__meta = {
            ignoredFields: changeRequest.__ignoredfields || []
        };
        return result;
    }

    return new sn_ws_err.BadRequestError("Failed to create change with template");
})(request, response);
