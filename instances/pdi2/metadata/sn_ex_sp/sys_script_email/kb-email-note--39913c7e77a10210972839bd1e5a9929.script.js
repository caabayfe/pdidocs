(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
		var note = gs.getMessage('Note: The information in this email is current as of sending. For the latest updates, access the article directly from the portal.');
		template.print('<div style="padding-bottom: 4px;">'+note+'</div>');

})(current, template, email, email_action, event);
