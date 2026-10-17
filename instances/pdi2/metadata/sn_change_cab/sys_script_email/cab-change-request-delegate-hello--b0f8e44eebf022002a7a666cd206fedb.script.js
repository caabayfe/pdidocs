(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	if (!event.parm1)
		return;
	
	var userGr = new GlideRecord("sys_user");
	if (!userGr.get(event.parm1))
		return;
	
	var name = userGr.first_name;
	if (!name)
		name = userGr.getDisplayValue();
	
	template.print("Hello " + name + ",\n");
	template.print("\n");

})(current, template, email, email_action, event);
