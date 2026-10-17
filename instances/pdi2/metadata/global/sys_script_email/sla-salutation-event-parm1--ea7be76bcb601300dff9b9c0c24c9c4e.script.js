(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var user = GlideUser.getUserByID(event.parm1);
	if (user.exists())
		template.print(gs.getMessage("Hello {0},", user.getDisplayName()));
	else
		template.print(gs.getMessage("Hello,"));

})(current, template, email, email_action, event);
