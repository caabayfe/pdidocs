(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var TABLES = {
        INCIDENT: "incident",
        CHANGE: "change_request"
    };
    var LINK_FIELD = 'rfc';

    /**
     * actionId: search UI Action's unique ID
     * incidentId: sys_id of Incident record which has search term
     * changeId: sys_id of Change record which is the search result
     * actionStage: to indicate whether this request is sent before or after modal
     */

    var actionId = request.body.data.actionId;
    var incidentId = request.body.data.currentId;
    var changeId = request.body.data.resourceId;
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
    if (!gs.hasRole('itil,sn_incident_write')) {
        addErrorMessage(gs.getMessage("Roles are insufficient to perform the action"));
        return response.setBody(body);
    }

    var changeGr = new GlideRecord(TABLES.CHANGE);
    if (!changeGr.get(changeId)) {
        addErrorMessage(gs.getMessage("Invalid Change Request record"));
        return response.setBody(body);
    }

    var incidentGr = new GlideRecord(TABLES.INCIDENT);
    if (!incidentGr.get(incidentId)) {
        addErrorMessage(gs.getMessage("Invalid Incident record"));
        return response.setBody(body);
    }

    var errMsg = gs.getMessage('Updating "Change Request" field on {0} has failed', incidentGr.getDisplayValue());
    var infoMsg = gs.getMessage('{0} has been linked as Request for Change to {1}.', [changeGr.getDisplayValue(), incidentGr.getDisplayValue()]);

    body.action_id = actionId;
    body.item_id = TABLES.INCIDENT + ":" + incidentGr.getUniqueValue();

    if (actionId.includes('rest')) {
        if (actionStage === 'pre_modal') {
            body.successful = true;
            body.useModal = true;
            body.modalTitle = gs.getMessage('Link to incident');
            body.errMsg = errMsg;
            body.modalInfoMsg = gs.getMessage('You are linking the current {0} as Request for Change to {1}', [changeGr.getDisplayValue('number'), incidentGr.getDisplayValue('number')]);
            body.modalFields = [{
                label: gs.getMessage('{0} (Private)', incidentGr.work_notes.getLabel()),
                name: 'work_notes',
                value: '',
                fieldType: 'textarea'
            }, {
                label: gs.getMessage('{0} (Customer visible)', incidentGr.comments.getLabel()),
                name: 'comments',
                value: '',
                fieldType: 'textarea'
            }];
            body.updateCurrentRecord = false;
            body.postModalRestRequired = true;
            return response.setBody(body);
        } else if (actionStage === 'post_modal') {
            incidentGr.setValue(LINK_FIELD, changeGr.getUniqueValue());
            if (incidentGr.update()) {
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
    incidentGr.setValue(LINK_FIELD, changeGr.getUniqueValue());
    if (incidentGr.update()) {
        body.succeed = true;
        body.message = infoMsg;
    } else {
        body.message = errMsg;
    }
    response.setBody(body);
})(request, response);
