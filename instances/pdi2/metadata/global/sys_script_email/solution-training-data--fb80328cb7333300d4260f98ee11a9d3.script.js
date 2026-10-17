(function runMailScript(/* GlideRecord */ current, /* TemplatePrinter */ template,
          /* Optional EmailOutbound */ email, /* Optional GlideRecord */ email_action,
          /* Optional GlideRecord */ event) {
	
		var url = '';
		var nav_to = '';
		url = gs.getProperty("glide.email.override.url");
		if (!url) {
			url = gs.getProperty("glide.servlet.uri");
			nav_to = 'nav_to.do';
		}
		template.print('<a href=' + url + nav_to + '?uri=sn_ml_ui_AI_Landing_Page.do>Predictive Intelligence Home Page</a>');
	
})(current, template, email, email_action, event);
