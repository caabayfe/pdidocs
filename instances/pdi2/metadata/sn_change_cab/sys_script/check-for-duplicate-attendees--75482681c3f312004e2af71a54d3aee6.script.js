(function executeRule(current, previous /*null when async*/) {
	var gr = new GlideRecord("cab_attendee");
	gr.addQuery("cab_meeting", current.cab_meeting);
	gr.addQuery("attendee", current.attendee);
	gr.query();
	if(gr.next()){
        gs.addErrorMessage(gs.getMessage("Attendee {0} already exists for CAB meeting {1} on {2}",
									[current.attendee.getDisplayValue(), current.cab_meeting.getDisplayValue(), current.cab_meeting.start.getDisplayValue()]));
		current.setAbortAction(true);
	}
})(current, previous);
