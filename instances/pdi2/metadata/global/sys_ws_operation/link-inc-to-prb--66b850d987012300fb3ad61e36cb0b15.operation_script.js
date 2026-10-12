(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var TABLES = {
        INCIDENT: "incident",
        PROBLEM: "problem"
    };
	
    var LINK_FIELD = 'problem_id';

    if (!gs.hasRole('itil,sn_incident_write'))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Roles are insufficient to perform the action")
        });

    /**
     * isAgentAssist: to indicate whether this is REST call is from Agent Assist
     * actionId: search UI Action's unique ID
     * incidentId: sys_id of Incident record which has search term
     * problemId: sys_id of Problem record which is the search result
     */

    var isAgentAssist = request.body.data.isAgentAssist;
    var actionId = request.body.data.actionId;
    var incidentId = request.body.data.currentId;
    var problemId = request.body.data.resourceId;
    var body = {};
    
    var problemGr = new GlideRecord(TABLES.PROBLEM);
    if (!problemGr.get(problemId))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Invalid Problem record")
        });
    
    if (isAgentAssist) {
        body.succeed = true;
        body.actionId = request.body.data.actionId;
        body.resourceRecord = {};
        body.resourceRecord.sys_id = problemId;
        body.resourceRecord.number = problemGr.number;
        body.linkField = LINK_FIELD;
        body.modalTitle = gs.getMessage('Link to incident');
	body.confirmationMessage = gs.getMessage('You are linking the current {0} as a Parent to {1}');
	body.successMessage = gs.getMessage('{0} has been linked as a Parent to {1}');
        response.setBody(body);
        return;
    }

    var incidentGr = new GlideRecord(TABLES.INCIDENT);
    if (!incidentGr.get(incidentId))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Invalid Incident record")
        });

    incidentGr.setValue(LINK_FIELD, problemGr.getUniqueValue());
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
        body.message = gs.getMessage('Updating "Problem" field on {0} has failed', incidentGr.getDisplayValue());
    } else {
        body.succeed = true;
        body.message = gs.getMessage('{0} has been linked as a Parent to {1}', [problemGr.getDisplayValue(), incidentGr.getDisplayValue()]);
    }
    response.setBody(body);

})(request, response);
