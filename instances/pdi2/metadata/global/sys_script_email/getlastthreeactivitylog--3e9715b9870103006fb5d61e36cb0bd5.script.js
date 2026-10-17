(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
			var activities = current.incident_alert.source_incident.actions_taken.getJournalEntry(3);
			var activityArray = activities.split("\n\n");
			template.print("<br/>");
			for(var i = 0; i < activityArray.length; i++)
				template.print(activityArray[i]+"<br/>");

})(current, template, email, email_action, event);
