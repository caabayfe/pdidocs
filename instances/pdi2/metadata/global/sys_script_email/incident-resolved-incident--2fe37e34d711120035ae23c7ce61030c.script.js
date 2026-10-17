(function runMailScript(current, template, email, email_action, event) {
	template.print('<p><font size="5" color="#808080" face="helvetica">');
	template.print(gs.getMessage('Your incident has been resolved.'));
	template.print('</font></p>');
	template.print('<p><font size="4" color="#808080" face="helvetica">');
	var days = parseInt(gs.getProperty("glide.ui.autoclose.time"));
	if (days > 0) {
		template.print(gs.getMessage('The incident will automatically close '));
		var hours = days * 24;

		if (days <= 3) {
			if(hours == 1) 
				template.print(gs.getMessage('in {0} hour', hours));
			else
				template.print(gs.getMessage('in {0} hours', hours));
		} else {
			if(days == 1)
				template.print(gs.getMessage('in {0} day', days));
			else 
				template.print(gs.getMessage('in {0} days', days));
		}
	}
	template.print('</font></p>');
})(current, template, email, email_action, event);
