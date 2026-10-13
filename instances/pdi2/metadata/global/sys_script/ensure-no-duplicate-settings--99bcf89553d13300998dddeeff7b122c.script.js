(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("sa_metric_config_rule_setting");
	gr.addQuery("rule", current.getValue("rule"));
	gr.addQuery("name", current.getValue("name"));
	gr.query();
	if (gr.next()) {
		gs.addInfoMessage(gs.getMessage("Duplicate setting detected."));
		current.setAbortAction(true);
	}
})(current, previous);
