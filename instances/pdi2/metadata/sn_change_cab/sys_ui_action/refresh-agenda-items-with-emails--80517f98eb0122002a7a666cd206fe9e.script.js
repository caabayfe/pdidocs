(function() {
	current.update();
	var now = new GlideDateTime();
	var cabMeeting = new sn_change_cab.CABMeeting(current);
	cabMeeting.refreshChangeAgendaItems();
	var extendTimings = cabMeeting.checkForExtendTimings();
	if (extendTimings && extendTimings.adjustmentNeeded) {
		var adjustmentEndTime = extendTimings.adjustmentEndTime.getDisplayValue();
		var adjustmentTimePerAgendaItem = extendTimings.adjustmentTimePerAgendaItem.getDisplayValue();
		gs.addInfoMessage(
			gs.getMessage("Based on your current time per agenda item of {0} and the meeting duration, you will not have enough time to complete all the agenda items.<br/>You will either need to reduce the time per item to {1} or extend the meeting end time to {2}",
						  [current.time_per_agenda_item.getDisplayValue(), adjustmentTimePerAgendaItem, adjustmentEndTime]));
	}
	var infoMessage = cabMeeting.createCABAttendeeNotifyEvents(now) > 0 ? gs.getMessage("Notifications sent to new/updated attendees") : gs.getMessage("No notifications sent since there is no new or updated attendee");
	gs.addInfoMessage(infoMessage);
	gs.setRedirect(current.getLink());
})();
