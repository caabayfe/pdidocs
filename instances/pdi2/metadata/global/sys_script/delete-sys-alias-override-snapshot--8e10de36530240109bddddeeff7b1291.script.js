(function executeRule(current, previous /*null when async*/) {
	var aliasOverrideRecord = new GlideRecord("sys_hub_alias_mapping_snapshot");
	aliasOverrideRecord.addQuery('source_table',current.getTableName());
	aliasOverrideRecord.addQuery('source_id',current.sys_id);
	aliasOverrideRecord.query();
	aliasOverrideRecord.deleteMultiple();
})(current, previous);
