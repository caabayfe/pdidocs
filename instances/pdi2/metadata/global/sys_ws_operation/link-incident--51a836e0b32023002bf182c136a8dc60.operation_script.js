(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var INCIDENT_TABLE = "incident";
    var LINK_FIELD = 'parent_incident';
    
    //DEF0115455: read only user can not link to incident
	var gr = new GlideRecord(INCIDENT_TABLE);
	if(!gr.canWrite() || !gr[LINK_FIELD].canWrite()){
		return response.setBody({
			succeed: false,
			message: gs.getMessage("Roles are insufficient to perform the action")
		});
	}
    /**
     * isAgentAssist: to indicate whether this is REST call is from Agent Assist
     * actionId: search UI Action's unique ID
     * currentId: sys_id of Incident record which has search term
     * resourceId: sys_id of Incident record which is search result
     */
    var isAgentAssist = request.body.data.isAgentAssist;
    var actionId = request.body.data.actionId;
    var currentId = request.body.data.currentId;
    var resourceId = request.body.data.resourceId;
    var body = {};

    var reverseDir;
    if (actionId.startsWith("link:"))
        reverseDir = false;
    else if (actionId.startsWith("link_to:"))
        reverseDir = true;
    else
        reverseDir = false;

    var grResource = new GlideRecord(INCIDENT_TABLE);
    if (!grResource.isValid() || !grResource.get(resourceId))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Invalid resource record")
        });

    // if the request is from Agent Assist, we only need to return info of the resource record
    if (isAgentAssist) {
        body.succeed = true;
        body.actionId = request.body.data.actionId;
        body.resourceRecord = {};
        body.resourceRecord.sys_id = resourceId;
        body.resourceRecord.number = grResource.number;
        body.linkField = LINK_FIELD;
        body.modalTitle = actionId === 'link_to:link_to_major_incident' ? gs.getMessage('Link to Major Incident') : gs.getMessage('Link to incident');
        body.confirmationMessage = gs.getMessage('You are linking the current {0} as a Parent to {1}');
        body.successMessage = gs.getMessage('{0} has been linked as a Parent to {1}.');
        response.setBody(body);
        return;
    }

    var grCurrent = new GlideRecord(INCIDENT_TABLE);
    if (!grCurrent.isValid() || !grCurrent.get(currentId))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Invalid current record")
        });

    var parentRecord;
    var childRecord;

    if (!reverseDir) {
        parentRecord = grCurrent;
        childRecord = grResource;
    } else {
        parentRecord = grResource;
        childRecord = grCurrent;
    }

    // link two records
    childRecord.setValue(LINK_FIELD, parentRecord.getUniqueValue());
    var result = childRecord.update();

    /**
     * action_id (mandatory): search UI Action's unique ID, AS/AI will use it to determine how to handle result
     * item_id (optional): "table_name:record_id", having this tells AS/AI to refresh child record's UI Action list due to link action's change on child record
     * succeed (mandatory): indicates link action is successfully done or not
     * message (optional): shows on top of the form after action is performed
     */
    body.action_id = actionId;
    body.item_id = INCIDENT_TABLE + ":" + childRecord.getUniqueValue();
    if (!result) {
        body.succeed = false;
        body.message = gs.getMessage('Updating "Parent incident" field on {0} has failed', [childRecord.getDisplayValue()]);
    } else {
        body.succeed = true;
        body.message = gs.getMessage('{0} has been linked as a Parent to {1}.', [parentRecord.getDisplayValue(), childRecord.getDisplayValue()]);
    }
    response.setBody(body);
})(request, response);
