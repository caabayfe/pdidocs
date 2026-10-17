var util = new sn_cmdb_ws.CMDBWorkspaceUtil();
if (util.isCMDBArchiveRuleChunk(event.instance)) {
	util.updateFeatureRuntimeAttribute();
	gs.debug('CI archived, trigger CMDB Workspace query full scan');
}
