(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
		/* Optional EmailOutbound */
		email, /* Optional GlideRecord */ email_action,
		/* Optional GlideRecord */
		event) {


		template.print(new Date().getFullYear().toString());

	})(current, template, email, email_action, event);
