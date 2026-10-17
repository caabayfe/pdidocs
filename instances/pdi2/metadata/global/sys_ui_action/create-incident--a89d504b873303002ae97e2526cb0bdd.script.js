var canCreateIncident = false;
if ((current.isNewRecord() && current.canCreate()) || (!current.isNewRecord() && current.canWrite()))
	canCreateIncident = current.update();
else
	canCreateIncident = true;

if (canCreateIncident) {
	var inc = new GlideRecord("incident");
	inc.initialize();
	inc.caller_id = current.opened_for;
	inc.short_description = current.short_description;
	if (GlidePluginManager.isActive("sn_itsm_gen_ai") && current.chat_summary && (current.chat_summary.toString()).length < 4000) {
		inc.description = current.chat_summary;
	}
	inc.origin_table = "interaction";
	inc.origin_id = current.sys_id;
	if (gs.getProperty("com.snc.incident.create_from_interaction.save") === 'true') {
		inc.work_notes = gs.getMessage('Incident created from Interaction {0}', current.number);
		var incSysId = inc.insert();
		if (incSysId) {
			var interactionRelatedGR = new GlideRecord("interaction_related_record");
			interactionRelatedGR.initialize();
			interactionRelatedGR.interaction = current.sys_id;
			interactionRelatedGR.document_table = 'incident';
			interactionRelatedGR.document_id = incSysId;
			interactionRelatedGR.insert();
		}
	}
	action.openGlideRecord(inc);
	new InteractionRelationshipUtil().copyAttachments(current, inc);
}
