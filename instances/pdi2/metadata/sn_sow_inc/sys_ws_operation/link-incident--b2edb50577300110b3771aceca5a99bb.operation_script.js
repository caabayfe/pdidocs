(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var TABLES = {
        INCIDENT: "incident"
    };

    var LINK_FIELD = 'parent_incident';

    /**
     * actionId: search UI Action's unique ID
     * incidentId: sys_id of Incident record which has search term
     * changeId: sys_id of Change record which is the search result
     * actionStage: to indicate whether this request is sent before or after modal
     */

    var actionId = request.body.data.actionId;
    var currentId = request.body.data.currentId;
    var resourceId = request.body.data.resourceId;
    var actionStage = request.body.data.actionStage;
    var body = {};

    /**
     * action_id (mandatory): search UI Action's unique ID, AS/AI will use it to determine how to handle result
     * item_id (optional): "table_name:record_id", having this tells AS/AI to refresh child record's UI Action list due to link action's change on child record
     * succeed (mandatory): indicates link action is successfully done or not for non-rest call's
     * successful (mandatory): indicates link action is successfully done or not for rest call's
     * message (optional): shows on top of the form after action is performed
     */

    if (actionId.includes('rest'))
        body.successful = false;
    else
        body.succeed = false;

    function addErrorMessage(errorMessage) {
        if (actionId.includes('rest'))
            body.errMsg = errorMessage;
        else
            body.message = errorMessage;
    }

    var gr = new GlideRecord(TABLES.INCIDENT);
    //DEF0115455: read only user can not link to incident
    if (!gr.canWrite() || !gr[LINK_FIELD].canWrite()) {
        addErrorMessage(gs.getMessage("Roles are insufficient to perform the action"));
        return response.setBody(body);
    }

    var grResource = new GlideRecord(TABLES.INCIDENT);
    if (!grResource.isValid() || !grResource.get(resourceId)) {
        addErrorMessage(gs.getMessage("Invalid resource record"));
        return response.setBody(body);
    }

    var grCurrent = new GlideRecord(TABLES.INCIDENT);
    if (!grCurrent.isValid() || !grCurrent.get(currentId)) {
        addErrorMessage(gs.getMessage("Invalid current record"));
        return response.setBody(body);
    }

    var errMsg = gs.getMessage('Updating "Parent incident" field on {0} has failed', grCurrent.getDisplayValue());
    var infoMsg = gs.getMessage('{0} has been linked as a Parent to {1}.', [grResource.getDisplayValue(), grCurrent.getDisplayValue()]);

    body.action_id = actionId;
    body.item_id = TABLES.INCIDENT + ":" + grCurrent.getUniqueValue();

    if (actionId.includes('rest')) {
        if (actionStage === 'pre_modal') {
            body.successful = true;
            body.useModal = true;
            body.resourceRecord = {};
            body.resourceRecord.sys_id = resourceId;
            body.resourceRecord.number = grResource.number;
            body.modalTitle = body.modalTitle = actionId === 'link_to:link_to_major_incident' ? gs.getMessage('Link to Major Incident') : gs.getMessage('Link to incident');
            body.errMsg = errMsg;
            body.modalInfoMsg = gs.getMessage('You are linking the current {0} as a Parent to {1}', [grResource.getDisplayValue(), grCurrent.getDisplayValue()]);
            body.modalFields = [{
                label: gs.getMessage('{0} (Private)', grCurrent.work_notes.getLabel()),
                name: 'work_notes',
                value: '',
                fieldType: 'textarea'
            }, {
                label: gs.getMessage('{0} (Customer visible)', grCurrent.comments.getLabel()),
                name: 'comments',
                value: '',
                fieldType: 'textarea'
            }];
            body.updateCurrentRecord = false;
            body.postModalRestRequired = true;
            return response.setBody(body);
        } else if (actionStage === 'post_modal') {
            grCurrent.setValue(LINK_FIELD, grResource.getUniqueValue());
            if (grCurrent.update()) {
                body.successful = true;
                body.useModal = false;
                body.infoMsg = infoMsg;
                body.updateCurrentRecord = true;
            } else {
                body.errMsg = errMsg;
            }
            return response.setBody(body);
        }
    }
    grCurrent.setValue(LINK_FIELD, grResource.getUniqueValue());
    if (grCurrent.update()) {
        body.succeed = true;
        body.message = infoMsg;
    } else {
        body.message = errMsg;
    }
    response.setBody(body);

})(request, response);
