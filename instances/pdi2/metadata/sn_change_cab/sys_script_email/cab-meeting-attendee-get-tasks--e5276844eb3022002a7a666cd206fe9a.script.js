(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	if (current.getTableName() != CAB.ATTENDEE)
		return;
	
	if (!current.attending_for_tasks.nil())
		template.print("You will be expected to discuss the following Change Requests as you are either the Assigned to user or the CAB Delegate: " + current.attending_for_tasks.getDisplayValue() + ".");

})(current, template, email, email_action, event);
