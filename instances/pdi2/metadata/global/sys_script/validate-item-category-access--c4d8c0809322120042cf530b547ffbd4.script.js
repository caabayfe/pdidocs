(function executeRule(current, previous /*null when async*/) {

	// Add your code here
	if(!current.sc_cat_item.canWrite() || !current.sc_category.canWrite()) {
		gs.addErrorMessage(gs.getMessage('Access to this catalog item or category is not allowed. Check your account permissions.'));
		current.setAbortAction(true);
	}
})(current, previous);
