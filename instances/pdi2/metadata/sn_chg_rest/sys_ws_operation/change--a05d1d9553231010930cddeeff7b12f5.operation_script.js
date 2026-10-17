(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var nameValuePairs = global.ChangeCommon.assign({}, request.queryParams, request.body.data);
    var state;
    if (nameValuePairs.state) {
        state = nameValuePairs.state;
        delete nameValuePairs.state;
    }

    var result;

    if (nameValuePairs.chg_model_template) {
        var chgModelTemplateSysId = nameValuePairs.chg_model_template + "";
        delete nameValuePairs.chg_model_template;

        if (!chgModelTemplateSysId)
            return new sn_ws_err.BadRequestError("Change Template id not provided");

        var changeRequest = global.ChangeRequest.newTemplatedChange(chgModelTemplateSysId, nameValuePairs);
        if (!changeRequest)
            return new sn_ws_err.BadRequestError("Failed to create change with change template: " + chgModelTemplateSysId);

        if ((!state && changeRequest.insert()) || (state && changeRequest.moveTo(state) && changeRequest.insert())) {
            result = changeRequest.toJS();
            result.__meta = {
                ignoredFields: changeRequest.__ignoredfields || []
            };
            return result;
        }
        return new sn_ws_err.BadRequestError("Failed to create change with change template: " + chgModelTemplateSysId);
    }

    var changeProcess = global.ChangeProcess.newChangeProcess(nameValuePairs);
    if (!changeProcess)
        return new sn_ws_err.BadRequestError("Change Request cannot be created with invalid parameters: " + JSON.stringify(nameValuePairs));

    if (state && !changeProcess.canMoveTo(state)) {
        var error = new sn_ws_err.ServiceError();
        error.setStatus(400);
        error.setMessage("Change Request cannot move to state: " + state);
        error.setDetail(JSON.stringify(changeProcess.evaluateMoveTo(state)));
        return error;
    }

    if ((!state && changeProcess.insert()) || (state && changeProcess.moveTo(state) && changeProcess.insert())) {
        result = changeProcess.toJS();
        result.__meta = {
            ignoredFields: changeProcess.__ignoredfields || []
        };
        return result;
    }

    var errorMessage = "Could not create Change Request.";
    var lastErrorMessage = changeProcess.getGlideRecord().getLastErrorMessage();
    if (lastErrorMessage)
        errorMessage += " " + lastErrorMessage;

    return new sn_ws_err.BadRequestError(errorMessage);
})(request, response);
