(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var TABLES = {
        INCIDENT: "incident",
        CHANGE: "change_request"
    };
	
    var LINK_FIELD = 'caused_by';

    if (!gs.hasRole('itil,sn_incident_write'))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Roles are insufficient to perform the action")
        });

    /**
     * isAgentAssist: to indicate whether this is REST call is from Agent Assist
     * actionId: search UI Action's unique ID
     * incidentId: sys_id of Incident record which has search term
     * changeId: sys_id of Change Request record which is the search result
     */

    var isAgentAssist = request.body.data.isAgentAssist;
    var actionId = request.body.data.actionId;
    var incidentId = request.body.data.currentId;
    var changeId = request.body.data.resourceId;
    var body = {};
    
    var changeGr = new GlideRecord(TABLES.CHANGE);
    if (!changeGr.get(changeId))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Invalid Change Request record")
        });
    
    if (isAgentAssist) {
        body.succeed = true;
        body.actionId = request.body.data.actionId;
        body.resourceRecord = {};
        body.resourceRecord.sys_id = changeId;
        body.resourceRecord.number = changeGr.number;
        body.linkField = LINK_FIELD;
        body.modalTitle = gs.getMessage('Link to incident');
	body.confirmationMessage = gs.getMessage('You are linking the current {0} as Caused by Change to {1}');
	body.successMessage = gs.getMessage('{0} has been linked as Caused by change to {1}.');
        response.setBody(body);
        return;
    }

    var incidentGr = new GlideRecord(TABLES.INCIDENT);
    if (!incidentGr.get(incidentId))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Invalid Incident record")
        });

    incidentGr.setValue(LINK_FIELD, changeGr.getUniqueValue());
    var result = incidentGr.update();

    /**
     * action_id (mandatory): search UI Action's unique ID, AS/AI will use it to determine how to handle result
     * item_id (optional): "table_name:record_id", having this tells AS/AI to refresh child record's UI Action list due to link action's change on child record
     * succeed (mandatory): indicates link action is successfully done or not
     * message (optional): shows on top of the form after action is performed
     */

    body.action_id = actionId;
    body.item_id = TABLES.INCIDENT + ":" + incidentGr.getUniqueValue();
    if (!result) {
        body.succeed = false;
        body.message = gs.getMessage('Updating "Caused by Change" field on {0} has failed', incidentGr.getDisplayValue());
    } else {
        body.succeed = true;
        body.message = gs.getMessage('{0} has been linked as Caused by change to {1}.', [changeGr.getDisplayValue(), incidentGr.getDisplayValue()]);
    }
    response.setBody(body);


})(request, response);
