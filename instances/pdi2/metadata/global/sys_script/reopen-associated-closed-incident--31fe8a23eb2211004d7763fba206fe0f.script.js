// This rule runs when a closed alert is reopened or goes into flapping for a new event
// It checks if the associated task is in the resolved or closed state
// If it is, then it can reopen that task or create a new one (checks the property alert_reopens_incident)
// If not, it just adds a comment on the task

var alertManager = new SNC.AlertManager();
alertManager.addStep("Alert BR: Reopen associated closed incident (after)");

var alertManagementAlertReopenHandlerDynamic;

if (EvtMgmtAlertMgmtProperties.isARMScopedAppActive()) {
    gs.include('sn_em_arm.EvtMgmtAlertMgmtAlertReopenHandler');
    alertManagementAlertReopenHandlerDynamic = new sn_em_arm.EvtMgmtAlertMgmtAlertReopenHandler();
} else {
    gs.include('EvtMgmtAlertManagementAlertReopenHandler');
    alertManagementAlertReopenHandlerDynamic = new EvtMgmtAlertManagementAlertReopenHandler();
}

alertManagementAlertReopenHandlerDynamic.onAlertReopen(current);
