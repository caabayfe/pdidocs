(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord('cmdb_ci_business_capability');
	gr.addQuery('order', current.order);
	gr.query();
	if(gr.hasNext()) {
		gs.addErrorMessage(gs.getMessage('Order number already exists for another business capability. Enter a unique order for this business capability.'));
		current.setAbortAction(true);
	}
})(current, previous);
