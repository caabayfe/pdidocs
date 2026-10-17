(function() {
	current.update();
	var notifiedAttendeesCount = new CABMeeting(current).createCABAttendeeNotifyEventsForNewAttendees();
	var infoMessage = notifiedAttendeesCount > 0 ? gs.getMessage("Notifications sent to new attendees") : gs.getMessage("No notifications sent as all attendees have already received the meeting request");
	gs.addInfoMessage(infoMessage);
	gs.setRedirect(current.getLink());
})();
