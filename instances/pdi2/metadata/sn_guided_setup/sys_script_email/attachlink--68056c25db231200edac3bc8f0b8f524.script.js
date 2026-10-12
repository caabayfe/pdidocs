(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
		var attachLink = '<a href="' + current.gsw_content_url +  '">' + current.gsw_content.title + '</a>';
		template.print(attachLink);
})(current, template, email, email_action, event);
