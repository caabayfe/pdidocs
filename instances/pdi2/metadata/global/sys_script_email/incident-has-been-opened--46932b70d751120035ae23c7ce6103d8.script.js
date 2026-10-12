(function runMailScript(current, template, email, email_action, event) {
	template.print('<p><font size="5" color="#808080" face="helvetica"><strong>');
	template.print(gs.getMessage('An incident has been opened on your behalf.'));
	template.print('</strong></font></p>');
})(current, template, email, email_action, event);
