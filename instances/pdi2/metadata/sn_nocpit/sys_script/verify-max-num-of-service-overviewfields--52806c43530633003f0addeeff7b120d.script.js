(function executeRule(current, previous /*null when async*/) {

	var maxNumOfFields = gs.getProperty('sn_nocpit.max_overview_fields_size', 4);
	var myOverviewFields = current.overview_fields.split(',');

	if (parseInt(myOverviewFields.length) > maxNumOfFields) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage("You have exceeded the maximum number of service overview fields, you can select only {0} fields", maxNumOfFields));
		return;
	}

})(current, previous);
