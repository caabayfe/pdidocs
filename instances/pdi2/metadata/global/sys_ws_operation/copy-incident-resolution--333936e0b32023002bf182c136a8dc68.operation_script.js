(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var payload = request.body.data;
    if (JSUtil.isEmpty(payload))
        return new sn_ws_err.BadRequestError("Payload is empty");
    var resourceId = payload.resourceId;
    var actionId = payload.actionId;
    
    var incidentGR = new GlideRecordSecure('incident');
    var fieldsToCopy = {};
    if (incidentGR.get(resourceId)) {
        fieldsToCopy.payload = {
            close_code: {
                value: incidentGR.getValue('close_code'),
                display_value: incidentGR.getDisplayValue('close_code')
            },
            close_notes:{
                value: incidentGR.getValue('close_notes'),
                display_value: incidentGR.getDisplayValue('close_notes')
            }
        };
        fieldsToCopy.meta = {
            number:{
                value: incidentGR.getValue('number'),
                display_value: incidentGR.getDisplayValue('number')
            }
        };
        fieldsToCopy['succeed'] = true;
        fieldsToCopy['action_id'] = actionId;
        fieldsToCopy['info_message'] = gs.getMessage('Resolution details are copied');
    } else {
        fieldsToCopy['succeed'] = false;
        fieldsToCopy['action_id'] = actionId;
        fieldsToCopy['info_message'] = gs.getMessage('Could not find Incident');
	}

    response.setBody(fieldsToCopy);
})(request, response);
