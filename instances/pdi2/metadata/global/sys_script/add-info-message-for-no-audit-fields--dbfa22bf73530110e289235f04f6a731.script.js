(function executeRule(current, previous /*null when async*/ ) {

	var noAuditFieldsInConditions = new SLADefinition(current).getNoAuditFieldsinConditions();

	var conditionFieldNames = Object.keys(noAuditFieldsInConditions);
	if (conditionFieldNames.length === 0)
		return;


	var fieldInfoMsg = "";
	for (var i = 0; i < conditionFieldNames.length; i++) {
		var noAuditConditionFields = noAuditFieldsInConditions[conditionFieldNames[i]];
		var noAuditFieldLabels = [];
		noAuditConditionFields.forEach(function(noAuditField) {
			noAuditFieldLabels.push(GlideStringUtil.escapeHTML(noAuditField.label));
		});

		fieldInfoMsg += GlideStringUtil.escapeHTML(current[conditionFieldNames[i]].sys_meta.label) + ": " + noAuditFieldLabels + "<br/>";
	}

	g_scratchpad.permanentMessages = [];
	g_scratchpad.permanentMessages.push(gs.getMessage("The following conditions reference the listed fields which have the \"no_audit\" attribute set to true.  Without audit data for these fields SLA processing (including SLA Repair and Timeline) may not function correctly:<br/><br/>{0}<br/>Recommendation is to only use audited fields in SLA conditions", fieldInfoMsg));

})(current, previous);
