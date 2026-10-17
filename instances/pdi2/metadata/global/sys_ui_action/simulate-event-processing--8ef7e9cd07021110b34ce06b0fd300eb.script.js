var eventProcessor = new SNC.EvtMgmtEventProcessor();
var simulatedAlertStr = eventProcessor.simulateEventProcessing(current.sys_id);
var infoMessageStr = "";
if (!gs.nil(simulatedAlertStr)) {
    // sys_id of the simulated alert
    if (simulatedAlertStr.trim().length == 32) {
        var simulatedGr = new GlideRecord("em_alert_simulations");
        if (simulatedGr.get(simulatedAlertStr)) {
            var simulatedAlertNumber = simulatedGr.getValue("number");
            infoMessageStr += "<a href=/em_alert_simulations.do?sys_id=" + simulatedAlertStr + "\">" + simulatedAlertNumber + "</a>";
            infoMessageStr += gs.getMessage(" was created.");
            infoMessageStr += "<br/>";
            infoMessageStr += gs.getMessage("For more information on the event processing stages change the value of the property 'evt_mgmt.log_debug' to true.");
        }
    }
    //error in simulate event processing
    else {
        infoMessageStr += gs.getMessage("The simulated alert wasn't created due to the following error:");
        infoMessageStr += "<br/>";
        if (simulatedAlertStr === 'Error in processing event.') {
            // The error was updated in the 'error_msg' field of the event.
            var eventGr = new GlideRecord('em_event');
            eventGr.get(current.sys_id);
            var currError = eventGr.getValue('error_msg');
            infoMessageStr += currError;
        } else {
            infoMessageStr += simulatedAlertStr;
        }
    }
    if (!gs.nil(infoMessageStr)) {
        gs.addInfoMessage(infoMessageStr);
    }
}
action.setRedirectURL(current);
