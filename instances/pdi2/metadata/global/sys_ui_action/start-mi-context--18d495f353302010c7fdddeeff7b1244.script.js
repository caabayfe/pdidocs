// TODO: this is temp implementation for testing
var authUtil = new MiIgniteAuthUtil();
authUtil.validateKeyCount();

var setupUtil = new sn_metrics_ng.MetricIntelligenceSetup();
var result = setupUtil.setupMI(current.mid_server, current.getDisplayValue(current.mid_server));
if (result["status"] == "EXISTING"){
	gs.info(gs.getMessage("MI Metric extension already exists for this MID"));
}
else if (result["status"] == "ERROR"){
	gs.addErrorMessage(result["message"]);
	gs.addErrorMessage(gs.getMessage("MI Setup failed; Check the system log for more details"));
}
else if (result["status"] == "OK"){
	gs.addInfoMessage(gs.getMessage("MI Setup has created the Metric Intelligence Extension; Wait a few minutes and verify that the extension status has changed to 'Started'"));
}
action.setReturnURL(current);
action.setRedirectURL(current);
