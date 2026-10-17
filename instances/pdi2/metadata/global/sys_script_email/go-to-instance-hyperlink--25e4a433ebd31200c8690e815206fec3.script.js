(function runMailScript(current, template, email, email_action, event) {
	
	template.print('<a href="' + gs.getProperty('glide.servlet.uri') + '" style="color:#ffffff; text-decoration: none !important;">' + 'Go to Instance' + '</a>');
	
})(current, template, email, email_action, event);
