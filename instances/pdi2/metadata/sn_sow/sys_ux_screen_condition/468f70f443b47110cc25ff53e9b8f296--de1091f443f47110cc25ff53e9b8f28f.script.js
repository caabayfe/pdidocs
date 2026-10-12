(function checkScreenVisibility(params) {
	var recGr = new GlideRecord(params.data.table);
	var isNewRecord = params.data.sysId == -1;
	var sysId = gs.nil(params.data.sysId) ? '' : params.data.sysId;
	if (!isNewRecord && !recGr.get(params.data.sysId)) {
		return false;
	}

	if (params.data.table == 'incident') {
		return (recGr.active || isNewRecord) && (gs.hasRole('itil') || gs.hasRole('sn_incident_write'));
	} else if (params.data.table == 'change_task' || params.data.table == 'change_request') {
		return (recGr.active || isNewRecord) && (gs.hasRole('itil') || gs.hasRole('sn_change_write'));
	} else if (params.data.table == 'problem') {
		return (recGr.active || isNewRecord) && (gs.hasRole('itil') || gs.hasRole('sn_problem_write'));
	} else if (params.data.table == 'problem_task') {
		return (recGr.active || isNewRecord) && (gs.hasRole('itil') || gs.hasRole('sn_problem_write') || gs.hasRole('problem_task_analyst'));
	} else if (params.data.table == 'interaction') {
		return (recGr.active || isNewRecord) && (gs.hasRole('itil') || gs.hasRole('interaction_agent'));
	} else if (params.data.table == 'kb_knowledge' || params.data.table.includes('kb_template_')) {
		var canWrite = false;
    if ((isNewRecord && recGr.canCreate()) || (recGr.get(sysId) && recGr.canWrite()))
        canWrite = true;
    if (canWrite &&
        recGr.workflow_state != 'pending_retirement' &&
        recGr.workflow_state != 'retired' &&
        recGr.workflow_state != 'outdated') {
            if (new global.KBViewModel().isVersioningEnabled() && recGr.workflow_state == "published")
                return new global.KnowledgeUIAction().getEditableFields().includes("short_description");
            else
                return true;
        }
    return false;
	} else if (params.data.table == 'em_alert') {
		return gs.hasRole('evt_mgmt_user');
	} else if (params.data.table == 'universal_request') {
		return ((recGr.active && !recGr.primary_task) || isNewRecord) && (gs.hasRole('sn_uni_req.routing_agent'));
	}

	return false;
})(inputProperties);
