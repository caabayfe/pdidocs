(function executeRule(current, previous /*null when async*/) {
	g_scratchpad.sla_metadata = {"engine" : gs.getProperty('com.snc.sla.engine.version', "2010"),
								 "default_conditionclass" : gs.getProperty('com.snc.sla.default_conditionclass', 'SLAConditionBase'),
								 "current_conditionclass" : current.getValue('condition_class'),
								 "is_sla_admin" : gs.hasRole("sla_admin")};
	
	var taskTables = getTableExtensions("task");
	var taskTableLabels = {};
	for (var i = 0; i < taskTables.size(); i++) {
		var tableName = taskTables.get(i);
		taskTableLabels[tableName] = GlideMetaData.getTableLabel(tableName);
	}
	
	g_scratchpad.sla_metadata["task_table_labels"] = taskTableLabels;
	
	if (!GlideTableDescriptor.get("service_sla_result").isValid())
		return;
	
	var slaUtil = new SLAUtil();
	var isServiceCommitmentSLA = slaUtil.isServiceCommitmentSLA(current);
	g_scratchpad.sla_metadata["is_service_commitment"] = isServiceCommitmentSLA;
	
	if (!isServiceCommitmentSLA)
		return;

	g_scratchpad.sla_metadata["is_legacy_service_commitment"] = slaUtil.isLegacySLACommitmentsActive();
	
	var serviceCommitmentGr = new GlideRecord("service_commitment");
	serviceCommitmentGr.addQuery("type", "SLA");
	serviceCommitmentGr.addQuery("sla", current.getUniqueValue());
	serviceCommitmentGr.query();
	
	g_scratchpad.sla_metadata["has_commitments"] = serviceCommitmentGr.hasNext();
	
	serviceCommitmentGr.addJoinQuery("service_offering_commitment", "sys_id", "service_commitment");
	serviceCommitmentGr.query();
	
	g_scratchpad.sla_metadata["has_offerings"] = serviceCommitmentGr.hasNext();
})(current, previous);
