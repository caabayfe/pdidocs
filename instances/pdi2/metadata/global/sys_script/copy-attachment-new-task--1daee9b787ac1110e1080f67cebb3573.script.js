(function executeRule(current, previous /*null when async*/ ) {
	var session = gs.getSession();
	var interactionId = session.getClientData('parent_interaction');
	session.clearClientData('parent_interaction');
	
	if (!gs.nil(interactionId) && new global.VAGlobalUtil().isAttachmentCopyEnabled(current.getTableName())) {
		var interactionGr = new GlideRecord('interaction');
		if (interactionGr.get(interactionId)) {
			new InteractionRelationshipUtil().copyAttachments(interactionGr, current);
		}
	}

})(current, previous);
