(function executeRule(current, previous /*null when async*/) {

	var interactionId = gs.getSession().getClientData('parent_interaction');
	var interactionGr = new GlideRecord('interaction');
	if (interactionGr.get(interactionId))
		current.work_notes.setJournalEntry(gs.getMessage('Problem created from Interaction {0}', interactionGr.number));

})(current, previous);
