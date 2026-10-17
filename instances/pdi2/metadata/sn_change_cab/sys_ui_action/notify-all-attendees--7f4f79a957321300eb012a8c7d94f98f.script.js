(function() {
	current.update();
	var notifiedAttendeesCount = new CABMeeting(current).createCABAttendeeNotifyEvents();
	var infoMessage = notifiedAttendeesCount > 0 ? gs.getMessage("Notifications sent to all attendees") : gs.getMessage("No notifications sent as there are no attendees");
	gs.addInfoMessage(infoMessage);
	gs.setRedirect(current.getLink());
})();
