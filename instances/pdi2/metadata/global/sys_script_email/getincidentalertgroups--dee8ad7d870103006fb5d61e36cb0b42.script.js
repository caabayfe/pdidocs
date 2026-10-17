(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	
			var gr = new GlideRecord('contact');
			gr.addQuery('document',current.incident_alert.sys_id);
			gr.query();
			template.print("<br/>");
			while(gr.next()) {
				var name = gr.group.name.toString();
				//to avoid User Contact related list records.
				if(name.length > 1) {
						template.print(name+"<br/>");
				}
			}

})(current, template, email, email_action, event);
