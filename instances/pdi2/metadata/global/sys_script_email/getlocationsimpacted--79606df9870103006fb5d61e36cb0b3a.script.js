(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
			var incidentId = current.incident_alert.source_incident.sys_id;
			var gr = new GlideRecord('task_location');
			gr.addQuery('task',incidentId);
			gr.query();
			template.print("<br/>");
			while(gr.next())
				template.print(gr.location.name +"<br/>");
			
})(current, template, email, email_action, event);
