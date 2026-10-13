(function executeRule(current, previous /*null when async*/) {

    if(gs.getProperty("sa_analytics.filtered_alerts_enabled") == "false")
		gs.addErrorMessage(gs.getMessage("The property: sa_analytics.filtered_alerts_enabled is set to false. please change it back to true for the changes to be considered."));

})(current, previous);
