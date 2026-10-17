(function executeRule(current, previous /*null when async*/ ) {
    if (!current) return;

	var evtMgmtAlertTagsUtil = new global.EvtMgmtAlertTagsUtil();
	evtMgmtAlertTagsUtil.addNewAlertTagIfDoesntExistInTable(current.to_field);
})(current, previous);
