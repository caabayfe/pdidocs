(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
    var TABLES = {
        INCIDENT: "incident",
        PROBLEM: "problem"
    };
    var LINK_FIELD = "problem_id";

    if (!gs.hasRole('itil,sn_incident_write'))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Roles are insufficient to perform the action")
        });

    /**
     * actionId: search UI Action's unique ID
     * incidentId: sys_id of Incident record which is the search result
     * problemId: sys_id of Problem record which is the search term
     */

    var actionId = request.body.data.actionId;
    var incidentId = request.body.data.resourceId;
    var problemId = request.body.data.currentId;
    var actionStage = request.body.data.actionStage;


    var incidentGr = new GlideRecord(TABLES.INCIDENT);
    if (!incidentGr.get(incidentId))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Invalid Incident record")
        });

    var problemGr = new GlideRecord(TABLES.PROBLEM);
    if (!problemGr.get(problemId))
        return response.setBody({
            succeed: false,
            message: gs.getMessage("Invalid Problem record")
        });


    /**
     * action_id (mandatory): search UI Action's unique ID, AS/AI will use it to determine how to handle result
     * item_id (optional): "table_name:record_id", having this tells AS/AI to refresh child record's UI Action list due to link action's change on child record
     * succeed (mandatory): indicates link action is successfully done or not
     * message (optional): shows on top of the form after action is performed
     */


    var errMsg = gs.getMessage('Linking "Incident" record to {0} has failed', problemGr.getDisplayValue());
    var infoMsg = gs.getMessage('{0} has been linked to {1}.', [incidentGr.getDisplayValue('number'), problemGr.getDisplayValue('number')]);

    var body = {};
    body.action_id = actionId;
    body.item_id = TABLES.INCIDENT + ":" + incidentGr.getUniqueValue();

    if (actionId.includes('rest')) {
        if (actionStage === 'pre_modal') {
            body.successful = true;
            body.useModal = true;
            body.modalTitle = gs.getMessage('Link to Problem');
            body.errMsg = errMsg;
            body.modalInfoMsg = gs.getMessage('You are linking the current {0} to {1}', [incidentGr.getDisplayValue('number'), problemGr.getDisplayValue('number')]);
            body.modalFields = [{
                label: gs.getMessage('{0} (Private)', problemGr.work_notes.getLabel()),
                name: 'work_notes',
                value: '',
                fieldType: 'textarea'
            }];
            body.updateCurrentRecord = false;
            body.postModalRestRequired = true;
            return response.setBody(body);
        } else if (actionStage === 'post_modal') {
            if (linkIncToProb(incidentGr, problemGr)) {
                body.useModal = false;
                body.updateCurrentRecord = true;
                setResponse(true, infoMsg);
            } else {
                setResponse(false, errMsg);
            }
            return response.setBody(body);
        }
    }


    if (!linkIncToProb(incidentGr, problemGr)) {
        body.succeed = false;
        body.message = gs.getMessage('Updating "Problem" field on {0} has failed', incidentGr.getDisplayValue());
    } else {
        body.succeed = true;
        body.message = gs.getMessage('{0} has been added to this Problem', incidentGr.getDisplayValue());
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

    function linkIncToProb(incidentGr, problemGr) {
        incidentGr.setValue(LINK_FIELD, problemGr.getUniqueValue());
        return incidentGr.update();
    }

})(request, response);
