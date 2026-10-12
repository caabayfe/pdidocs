(function runAction(/*GlideRecord*/ current, /*GlideRecord*/ event, /*EmailWrapper*/ email, /*ScopedEmailLogger*/ logger, /*EmailClassifier*/ classifier) {

	if (!sys_email.user_id)
		return;

	var sysAttachmentsGr = new GlideSysAttachment().getAttachments("sys_email", event.parm1);
	if (!sysAttachmentsGr.next()) {
		return;
	}
	
	var attachmentContent = new GlideSysAttachment().getContent(sysAttachmentsGr);
	var uidMatch = attachmentContent.match(/UID:([a-fA-F0-9]{32})/);
	
	if (uidMatch == null)
		return;
	
	var meetingId = uidMatch[1];
	if (!meetingId)
		return;
	
	var cabAttendeeGr = new GlideRecord(CAB.ATTENDEE);
	cabAttendeeGr.addQuery("cab_meeting", meetingId);
	cabAttendeeGr.addQuery("attendee", sys_email.user_id);
	cabAttendeeGr.query();
	
	if (!cabAttendeeGr.next())
		return;
	
	var attendeeMatch = attachmentContent.match(/ATTENDEE;.*PARTSTAT=([^:;]*)/);
    var attendanceReply = null;
	if (attendeeMatch && attendeeMatch.length > 1)
		attendanceReply = attendeeMatch[1].toLowerCase();
	
	if (attendanceReply == null )
		return;
	
	var mapReplyToAttendance = {"tentative": "tentative",
							    "accepted": "attending",
							    "declined": "not_attending"};
	
	var attendeeAttendance = mapReplyToAttendance[attendanceReply];
	if (!attendeeAttendance)
		return;
	
	var cabAttendee = new CABAttendee(cabAttendeeGr);
	cabAttendee.setAttendance(attendeeAttendance);
	cabAttendee.update();
	
	sys_email.target_table = "cab_attendee";
	sys_email.instance = cabAttendeeGr.getUniqueValue();
	
})(current, event, email, logger, classifier);
