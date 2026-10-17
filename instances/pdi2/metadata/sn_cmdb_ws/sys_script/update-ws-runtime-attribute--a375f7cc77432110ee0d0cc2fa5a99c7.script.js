(function executeRule(current, previous /*null when async*/) {

	var util = new sn_cmdb_ws.CMDBWorkspaceUtil();
	util.updateFeatureRuntimeAttribute();
	gs.debug('CI deleted, trigger CMDB Workspace query full scan');

})(current, previous);
