var access = false;
if (!current.cab_meeting.nil())
	access = (new CABMeeting(current.cab_meeting.getRefRecord())).canAddAgendaItem();

access;
