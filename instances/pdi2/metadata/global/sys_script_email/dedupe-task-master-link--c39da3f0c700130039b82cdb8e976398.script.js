(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
/* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
/* Optional GlideRecord */ event) {
	
	var gr = new GlideRecord(current.table);
	gr.get(current.master_ci);
	var link = new GlideSubstituteURL().generateURL(gr, '');
	var display = gr.getDisplayValue();
	var anchor = "<a href='" + link +"'>" + display + "</a>";
	template.print(anchor);
	
})(current, template, email, email_action, event);
