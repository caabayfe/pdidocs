(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var name = current.attendee.first_name;
	if (!name)
		name = current.attendee.getDisplayValue();
	
	template.print("Hello " + name + ",");

})(current, template, email, email_action, event);
