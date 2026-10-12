(function runMailScript(current, template, email, email_action, event) {
	template.print('<p><font size="4" color="#999999" face="helvetica">');
	template.print(gs.getMessage('We value your input. Please help us by taking the time to fill out this short survey:'));
	template.print('</font></p>');
	template.print('<p><font face="helvetica">');
	template.print('<a style="font-size: 16px; font-family: Helvetica, Arial, sans-serif; color: #ffffff; text-decoration: none; border-radius: 3px; -webkit-border-radius: 3px; -moz-border-radius: 3px; background-color: #278efc; border: 1px solid #0368d4; display: inline-block; padding: 5px" href="${event.parm2}">' + gs.getMessage('Click here to take the survey') + '</a>');
	template.print('</font></p>');
})(current, template, email, email_action, event);
