(function executeRule(current, previous /*null when async*/) {

	var pageRegId = current.sys_id;
	if (current.parent_app != previous.parent_app) {
		var primaryExpParentRecord = GlideRecord("sys_ux_app");
		primaryExpParentRecord.addQuery("primary_experience", pageRegId);
		primaryExpParentRecord.query();

		if (primaryExpParentRecord.next()){
			gs.addErrorMessage(gs.getMessage("Please remove this experience as the primary experience in the Parent App table before updating this parent app association"));
			current.setAbortAction(true);
		}
	}

})(current, previous);
