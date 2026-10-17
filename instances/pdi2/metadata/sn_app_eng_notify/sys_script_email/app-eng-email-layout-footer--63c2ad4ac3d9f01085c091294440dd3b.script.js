(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {

		// Grab current year based on user's local time
        var currentYear = new GlideDateTime().getYearLocalTime();
		var footerMessage = gs.getMessage("You have received this email to update you about your recent app creation.");
		var footer = footerMessage;
		var copyrightMessage = gs.getMessage('{0}{1} ServiceNow | All Rights Reserved', ['&copy; ', currentYear]);
		template.print(footerMessage);
		template.print("\n");
		template.print(copyrightMessage);

})(current, template, email, email_action, event);
