function transform() {
	var wrapperFunction = function() {
		var progressMonitorUtil = new sn_cmdb_ws.CMDBWsProgressMonitorUtil();
		var DM = new sn_cmdb_ws.CMDBWsDMConstants();
		var progressId = progressMonitorUtil.createProgress(DM.EVENTS.MIGRATE_CERT_SCHEDULES);
		gs.eventQueue(DM.EVENTS.MIGRATE_CERT_SCHEDULES, current, progressId);

		return progressId;
	};
	
	return new sn_cmdb_ws.CMDBWsDataBrokerHandler().execute("sn_cmdb_ws_dm", "Data Manager - Create progress record and trigger migrate Certification Schedules event", wrapperFunction);
}
