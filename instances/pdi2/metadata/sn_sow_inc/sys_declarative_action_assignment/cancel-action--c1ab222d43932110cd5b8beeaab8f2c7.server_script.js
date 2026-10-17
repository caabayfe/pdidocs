var remedialActionEngine = new sn_reacf.RemedialActionEngine();
var cancelExecution = remedialActionEngine.cancelExecution(current);
var targetRecord = current.target_record_id.getRefRecord();
if (cancelExecution) {
    try {
        var inputs = {};
        inputs['remedial_action_execution_record'] = current; // GlideRecord of table: sn_reacf_remedial_action_execution 
        inputs['cancelation_reason'] = gs.getMessage("Action canceled by user {0}", gs.getUserDisplayName()); // String 
        var result = sn_fd.FlowAPI.getRunner().subflow('sn_sow_inc.cancel_remedial_action_playbook').inForeground().withInputs(inputs).run();
        var outputs = result.getOutputs();
        var status = outputs.status;
        var cancelRespObj = outputs.response;
        if (status == "Success" && cancelRespObj && cancelRespObj.canceledPlaybookContext && cancelRespObj.canceledPlaybookContext.length > 0) {
            gs.addInfoMessage(gs.getMessage("Action {0} on {1} has been cancelled.", [current.getDisplayValue("remedial_action"), targetRecord.getDisplayValue()]));
        } else {
            gs.addErrorMessage(gs.getMessage("Cannot cancel the action {0} on {1}. Please try again later.", [current.getDisplayValue("remedial_action"), targetRecord.getDisplayValue()]));
        }
    } catch (ex) {
        var message = ex.getMessage();
        gs.addErrorMessage(gs.getMessage("Cannot cancel the action {0} on {1}. Please try again later.", [current.getDisplayValue("remedial_action"), targetRecord.getDisplayValue()]));
        gs.error("Declarative action - Cancel playbook - server script : Failed to cancel given playbook {0}", message);
    }
} else {
    gs.addErrorMessage(gs.getMessage("Cannot cancel the action {0} on {1}. Please try again later.", [current.getDisplayValue("remedial_action"), targetRecord.getDisplayValue()]));
}
