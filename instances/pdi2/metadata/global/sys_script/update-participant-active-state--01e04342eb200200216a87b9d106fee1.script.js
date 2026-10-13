function onAfter(current, previous) {
	var part = current.notify_participant.getRefRecord();
	if (!(part && part.isValidRecord()))
		return;
	var gr = new GlideRecord("notify_participant_session");
	gr.addActiveQuery();
	gr.addQuery("notify_participant", current.notify_participant);
	gr.setLimit(1);
	gr.query();
	var state = gr.hasNext();
	if (state && !gs.nil(current.notify_call))
		return;
	var db = new global.NotifyDatabase();
	db.setConferenceCallParticipantActiveState(current.notify_participant.getRefRecord(), state);
}
