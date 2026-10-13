var eventId = gs.getSession().getClientData('em_refresh_event_id');
if (eventId) {
    var eventRuleManager = new SNC.EventRuleManager();
    var resultJSON = eventRuleManager.updateEventRuleDataFromEvent(current.getUniqueValue(), eventId);
    try {
        if (resultJSON) {
            var resultObj = JSON.parse(resultJSON);
            if ((resultObj.result) && (resultObj.message)) {
                if (resultObj.result === "true") {
                    gs.addInfoMessage(resultObj.message);
                } else {
                    gs.addErrorMessage(resultObj.message);
                }
            } else {
				//if updateEventRuleDataFromEvent returned a value, but there was a problem with parsing, just show the result
                gs.addInfoMessage(resultJSON);
            }
        } else {
			//result is null or empty or undefied
            gs.addErrorMessage(gs.getMessage("There was a problem with refresh operation."));
        }
    } catch (err) { //if updateEventRuleDataFromEvent returned a value, but there was a problem with parsing, just show the result
        gs.addInfoMessage(resultJSON);
    }
    var url = "$em_event_rule_designer.do?sys_id=" + current.getUniqueValue();
    action.setRedirectURL(url);
} else {
    gs.addErrorMessage(gs.getMessage("This operation is not supported. To refresh an event rule from event, please use the event form and press the \"Refresh Event Rule\" button."));
}
