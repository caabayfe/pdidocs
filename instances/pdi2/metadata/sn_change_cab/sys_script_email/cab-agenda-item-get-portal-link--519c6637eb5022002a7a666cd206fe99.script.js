(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	var meetingURL = new CABMeeting(current.cab_meeting.getRefRecord()).getPortalURL();
	template.print("To connect to the CAB Meeting click <a href='" + meetingURL + "'>here</a>.");
})(current, template, email, email_action, event);
