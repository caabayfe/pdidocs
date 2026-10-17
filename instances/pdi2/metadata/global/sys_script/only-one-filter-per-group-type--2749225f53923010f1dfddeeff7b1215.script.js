(function executeRule(current, previous /*null when async*/) {


	if(current.getValue("cmdb")== true)
		isTypeExists("cmdb", gs.getMessage("CMDB"));
	if(current.getValue("aggregated") == true)
		isTypeExists("aggregated", gs.getMessage("Aggregated"));
	if(current.getValue("automated") == true)
		isTypeExists("automated",gs.getMessage("Automated"));
	if(current.getValue("text") == true)
		isTypeExists("text",gs.getMessage("Text"));
	
	
	function isTypeExists(type, typeName){
		var gr = new GlideRecord("sa_agg_alert_filter");
		gr.addQuery("sys_id", "!=", current.getUniqueValue());
		gr.addActiveQuery();
		gr.addQuery(type, true);
		gr.setLimit(1);
		gr.query();

		if (gr.hasNext()) {
			gs.addErrorMessage(gs.getMessage("A filter was already defined for group type: {0}, only one filter can be applied to a group type. The filter is being changed to non-active",typeName));
			current.setValue('active', false);
		}
	}

})(current, previous);
