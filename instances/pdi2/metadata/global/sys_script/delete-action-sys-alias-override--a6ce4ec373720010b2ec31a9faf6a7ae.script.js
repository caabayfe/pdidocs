(function executeRule(current, previous /*null when async*/) {
	
	var aliasOverrideRecord = new GlideRecord("sys_hub_alias_mapping");
	aliasOverrideRecord.addQuery('source_table',current.getTableName());
	aliasOverrideRecord.addQuery('source_id',current.sys_id);
	aliasOverrideRecord.query();
	aliasOverrideRecord.deleteMultiple();
	
	var aliasOverrideSnapshotRecord = new GlideRecord("sys_hub_alias_mapping_snapshot");
	aliasOverrideSnapshotRecord.addQuery('source_table',current.getTableName());
	aliasOverrideSnapshotRecord.addQuery('source_id',current.sys_id);
	aliasOverrideSnapshotRecord.query();
	aliasOverrideSnapshotRecord.deleteMultiple();
	
})(current, previous);
