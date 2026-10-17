(function executeRule(current, previous /*null when async*/) {

	var prodInstName = current.value;
	var isProd = SNC.UsageAnalyticsScriptUtils.isDCProd();
	var myInstName = gs.getProperty('instance_name');
	
	if (isProd) {
		current.value = myInstName;
		
	} else if (!JSUtil.nil(prodInstName)) {
		
		var gr = new GlideRecord('ua_prod_inst');
		if (gr.isValid()) {
			gr.addQuery('name', prodInstName);
			gr.query();
			if (gr.getRowCount() == 0) {
				gs.addErrorMessage(gs.getMessage('Please specify a valid production instance name'));
				current.setAbortAction(true);
			}
		}
	}
	
})(current, previous);
