(function() {
	data.meetingId = $sp.getParameter('sys_id');
	data.userId = gs.getUserID();
	
	data.command = {};
	data.command.SHARE = 'share';
	data.command.CLEAR_AGENDA_DECISIONS = 'clear_agenda_decisions';
	function getMeetingGR() {
		var gr = new GlideRecord(CAB.MEETING);
		gr.get(data.meetingId);
		return gr;
	}

	// Check if we have the share command.
	if (typeof input !== 'undefined') {
		if (input.command == data.command.SHARE) {
			var meetingGr = getMeetingGR();
			var crs = CABRuntimeState.get(meetingGr.getUniqueValue());
			if (crs.getHost() === gs.getUserID() || crs.getNotesEditor() === gs.getUserID())
				(new CABMeeting(meetingGr)).shareMeetingNotes();
		}
		return;
	}
	
	data.i18n = {
		"notesRefreshed": gs.getMessage("Meeting notes updated by CAB Automation"),
		"notesSaved": gs.getMessage("Meeting notes saved"),
		"notesShared": gs.getMessage("Successfully shared notes to Attendees"),
		"concurrentUpdate": gs.getMessage("Meeting notes have updated since last save.  Please copy your changes and reopen Meeting Notes")
	};
})();
