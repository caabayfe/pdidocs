(function executeRule(current, previous /*null when async*/) {

	var curNum = current.number + '';
    if (current.operation() == "update" && previous != null && curNum == (previous.number + '')) {
        // For Update, if number has not changed no need to verify uniqueness
        return;
    }
	
	if (JSUtil.nil(curNum)) {
		gs.addErrorMessage(gs.getMessage("Invalid {0}. The number field cannot be empty.", [current.operation()]));
        current.setAbortAction(true);
		return;
	}
	
    // When Inserting new record or when value of number has changed, verify uniqueness
    var gr = new GlideRecord("cmdb_ci_service");
    gr.addQuery("number", curNum);
    gr.query();
    if (gr.getRowCount() > 0) {
        gs.addErrorMessage(gs.getMessage("Invalid {0}. Service with SN App Service ID: {1} already exists.", [current.operation(), curNum]));
        current.setAbortAction(true);
    }

})(current, previous);
