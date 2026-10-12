(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	if (current.getTableName() != CAB.ATTENDEE)
		return "";
	
	var cabMeeting = new CABMeeting(current.cab_meeting.getRefRecord());
	
	template.print(gs.getProperty('glide.servlet.uri') + cabMeeting.getPortalURL());

})(current, template, email, email_action, event);
