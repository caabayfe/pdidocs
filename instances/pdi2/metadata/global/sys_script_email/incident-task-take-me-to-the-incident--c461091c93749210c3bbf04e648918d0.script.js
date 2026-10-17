(function runMailScript(current, template, email, email_action, event) {
    var link = new EmailNotificationRedirection().getLink(current.getTableName(), current.getUniqueValue());
	
    template.print('<span style="font-size: 16px; color:#181A1F;">');
    template.print(gs.getMessage('You can view the incident task to track updates and make changes.'));
    template.print('</span>');

    template.print('<br><a href="' + link + '">');
    template.print(gs.getMessage('View incident task'));
    template.print('</a>');
})(current, template, email, email_action, event);
