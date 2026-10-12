(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

	current.email_content = global.CABEmailContent.generateHTMLEmailContent(current, email_action, event, email);
	
})(current, template, email, email_action, event);
