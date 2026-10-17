(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	if (event.parm1 + "" === current.task.assigned_to.getValue())
		template.print(gs.getMessage("SLA \"{0}\" associated with {1} has breached.", [current.sla.name, current.task.number]));
	else
		template.print(gs.getMessage("SLA \"{0}\" associated with {1}, assigned to {2}, has breached.", [current.sla.name, current.task.number, current.task.assigned_to.getDisplayValue()]));

})(current, template, email, email_action, event);
