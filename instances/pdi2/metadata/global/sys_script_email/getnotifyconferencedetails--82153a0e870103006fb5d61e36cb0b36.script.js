(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
			
			var incidentAlertId = current.incident_alert.sys_id;
			var gr = new GlideRecord('notify_conference_call');
			gr.addQuery('source',incidentAlertId);
			gr.query();
			while(gr.next()) {
				template.print("<br/>");
				template.print("Conference Number  : " + gr.number + "<br/>");
				template.print("Conference Code : " + gr.code + "<br/>");
			}

})(current, template, email, email_action, event);
