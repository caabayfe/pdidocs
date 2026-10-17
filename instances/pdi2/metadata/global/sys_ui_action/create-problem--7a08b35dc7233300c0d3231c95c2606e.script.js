if(current.update()){
	var prb = new GlideRecord("problem");
	prb.initialize();
	prb.short_description = current.short_description;
	if (gs.getProperty("com.snc.problem.create_from_interaction.save") === 'true') {
		prb.work_notes.setJournalEntry(gs.getMessage('Problem created from Interaction {0}', current.number));
		var prbSysId = prb.insert();
		if (prbSysId) {
			var interactionRelatedGR = new GlideRecord("interaction_related_record");
			interactionRelatedGR.initialize();
			interactionRelatedGR.interaction = current.sys_id;
			interactionRelatedGR.document_table = 'problem';
			interactionRelatedGR.document_id = prbSysId;
			interactionRelatedGR.insert();
		}
	}
	action.openGlideRecord(prb);
	new InteractionRelationshipUtil().copyAttachments(current, prb);
}
