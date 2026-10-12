(function checkScreenVisibility(params) {
	var recGr = new GlideRecord(params.table);
	var isNewRecord = params.sysId == -1;
	if (!isNewRecord && !recGr.get(params.sysId)) {
		return false;
	}

	if (params.table == 'incident') {
		return (recGr.active || isNewRecord) && (gs.hasRole('itil') || gs.hasRole('sn_incident_write'));
	} else if (params.table == 'change_task' || params.table == 'change_request') {
		return (recGr.active || isNewRecord) && (gs.hasRole('itil') || gs.hasRole('sn_change_write'));
	} else if (params.table == 'problem') {
		return (recGr.active || isNewRecord) && (gs.hasRole('itil') || gs.hasRole('sn_problem_write'));
	} else if (params.table == 'problem_task') {
		return (recGr.active || isNewRecord) && (gs.hasRole('itil') || gs.hasRole('sn_problem_write') || gs.hasRole('problem_task_analyst'));
	} else if (params.table == 'interaction') {
		return (recGr.active || isNewRecord) && (gs.hasRole('itil') || gs.hasRole('interaction_agent'));
	} else if (params.table == 'kb_knowledge') {
		return (recGr.canWrite() || (new global.KBViewModel().isVersioningEnabled() && new global.KnowledgeUIAction().getEditableFields().includes("short_description"))) && recGr.workflow_state != 'pending_retirement' && recGr.workflow_state != 'retired' && recGr.workflow_state != 'outdated' && recGr.canCreate() && recGr.canWrite();
	} else if (params.table == 'em_alert') {
		return gs.hasRole('evt_mgmt_user');
	}
	 
	return false;
})(inputProperties);
