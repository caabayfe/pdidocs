(function runMailScript(current, template, email, email_action, event) {
	template.print('<p><font size="6" color="#808080" face="helvetica">');
	template.print('${task_effective_number} - ${short_description}');
	template.print('</font></p>');
})(current, template, email, email_action, event);
