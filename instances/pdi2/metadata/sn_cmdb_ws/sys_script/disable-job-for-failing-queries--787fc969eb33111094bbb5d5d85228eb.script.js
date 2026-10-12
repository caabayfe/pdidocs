(function executeRule(current, previous /*null when async*/ ) {
    var util = new sn_cmdb_ws.CMDBWsInsightUtil();

    // update the job to mark active to false
    util.updateQBJobActive(current.getValue(util.COLS.QUERY), false);

    current.setWorkflow(false);
    current.setValue(util.COLS.STATUS, util.QB_STATUS.DISABLED);
	if (current.canWrite()) {
		current.update();
	}
    

})(current, previous);
