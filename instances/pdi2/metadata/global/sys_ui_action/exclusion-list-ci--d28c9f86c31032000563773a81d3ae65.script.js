var gr = new GlideRecord('em_alert_anomaly');
var message;
gr.get(current.sys_id);
if (gr.cmdb_ci.nil()){
	var errorMsg = gs.getMessage("Configuration Item is empty");
	gs.addErrorMessage(errorMsg);	
}
else{
	var exclusionlistRule = new GlideRecord('em_alert_promotion_blacklist');
	exclusionlistRule.addQuery("source", gr.source);
	exclusionlistRule.addQuery("cmdb_ci", gr.cmdb_ci);
	exclusionlistRule.query();
	if (exclusionlistRule.next()){
		message = gs.getMessage("Ci was already excluded");
		gs.addErrorMessage(message);
	}
	else{
		var elCi = new GlideRecord('cmdb_ci');
		elCi.get(gr.cmdb_ci);
		exclusionlistRule.setValue("source", gr.source);
		exclusionlistRule.setValue("cmdb_ci", gr.cmdb_ci);
		exclusionlistRule.insert();
		message = gs.getMessage(" {0} was excluded for promotion", elCi.name);
		gs.addInfoMessage(message);
	}
}
