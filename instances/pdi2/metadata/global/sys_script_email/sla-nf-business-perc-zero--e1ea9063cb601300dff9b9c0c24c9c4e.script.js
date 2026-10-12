(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	var businessElapsedPerc = Math.round(current.business_percentage - 0);
	template.print(businessElapsedPerc + "%");
})(current, template, email, email_action, event);
