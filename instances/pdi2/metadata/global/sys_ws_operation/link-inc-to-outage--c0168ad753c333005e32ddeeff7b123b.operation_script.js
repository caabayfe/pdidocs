(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var TABLES = {
        INCIDENT: "incident",
        OUTAGE: "cmdb_ci_outage",
        TASK_OUTAGE: "task_outage"
    };

    /**
     * actionId: search UI Action's unique ID
     * incidentId: sys_id of Incident record which has search term
     * outageId: sys_id of Outage record which is the search result
     * actionStage: to indicate whether this request is sent before or after modal
     */

    var actionId = request.body.data.actionId;
    var incidentId = request.body.data.currentId;
    var outageId = request.body.data.resourceId;
    var actionStage = request.body.data.actionStage;
    var body = {};

    /**
     * action_id (mandatory): search UI Action's unique ID, AS/AI will use it to determine how to handle result
     * item_id (optional): "table_name:record_id", having this tells AS/AI to refresh child record's UI Action list due to link action's change on child record
     * succeed (mandatory): indicates link action is successfully done or not for non-rest call's
     * successful (mandatory): indicates link action is successfully done or not for rest call's
     * message (optional): shows on top of the form after action is performed
     */
	
	var message = '';

    if (!gs.hasRole('itil,sn_incident_write')) {
        message = gs.getMessage("Roles are insufficient to perform the action");
        setResponse(false, message);
        return response.setBody(body);
    }

    var outageGr = new GlideRecord(TABLES.OUTAGE);
    if (!outageGr.get(outageId)) {
        message = gs.getMessage("Invalid Outage record");
        setResponse(false, message);
        return response.setBody(body);
    }

    var incidentGr = new GlideRecord(TABLES.INCIDENT);
    if (!incidentGr.get(incidentId)) {
        message = gs.getMessage("Invalid Incident record");
        setResponse(false, message);
        return response.setBody(body);
    }

    var errMsg = gs.getMessage('Linking "Outage" record to {0} has failed', incidentGr.getDisplayValue());
    var infoMsg = gs.getMessage('{0} has been linked to {1}.', [outageGr.getDisplayValue('number'), incidentGr.getDisplayValue('number')]);

    body.action_id = actionId;
    body.item_id = TABLES.INCIDENT + ":" + incidentGr.getUniqueValue();

    if (actionId.includes('rest')) {
        if (actionStage === 'pre_modal') {
            body.successful = true;
            body.useModal = true;
            body.modalTitle = gs.getMessage('Link to incident');
            body.errMsg = errMsg;
            body.modalInfoMsg = gs.getMessage('You are linking the current {0} to {1}', [outageGr.getDisplayValue('number'), incidentGr.getDisplayValue('number')]);
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
            if (createTaskOutage(outageId, incidentId)) {
                body.useModal = false;
                body.updateCurrentRecord = true;
                setResponse(true, infoMsg);
            } else {
                setResponse(false, errMsg);
            }
            return response.setBody(body);
        }
    }

    if (!createTaskOutage(outageId, incidentId)) {
        setResponse(false, errMsg);
    } else {
        setResponse(true, infoMsg);
    }
	
    return response.setBody(body);

    function setResponse(success, message) {
        if (actionId.includes('rest')) {
            body.successful = success;
            if (success) {
                body.infoMsg = message;
            } else {
                body.errMsg = message;
            }
        } else {
            body.succeed = success;
            body.message = message;
        }
        return;
    }

    function createTaskOutage(outageId, incidentId) {
        var taskOutageGr = new GlideRecord("task_outage");
        taskOutageGr.initialize();
        taskOutageGr.setValue("outage", outageId);
        taskOutageGr.setValue("task", incidentId);
        return taskOutageGr.insert();

    }

})(request, response);
