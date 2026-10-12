(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var emailMessage = "";
	var chgSocName = "";
	var data = JSON.parse(event.parm2);
	if (data) {
		emailMessage = data.message || "";
		chgSocName = data.chgSocName || "";
	}
	email.setSubject(gs.getMessage("{0} change schedule has been shared with you", chgSocName));
	email.setBody(emailMessage);

})(current, template, email, email_action, event);
