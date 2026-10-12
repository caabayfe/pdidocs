(function runMailScript(current, template, email, email_action, event) {
    var link = new EmailNotificationRedirection().getLink(current.getTableName(), current.getUniqueValue());
    if (email_action.name != "Incident Resolved") {
        template.print('<span style="font-size: 16px; color:#181A1F;">');
        template.print(gs.getMessage('You can view the incident to track updates and make changes.'));
        template.print('</span>');
    } else {
        template.print('<p><font size="16px" color="#181A1F;" face="Lato">');
        template.print(gs.getMessage('If you feel the issue is not resolved, please click the following link and reopen your incident:'));
        template.print('</font></p>');
    }

    template.print('<br><a href="' + link + '">');
    template.print(gs.getMessage('View incident'));
    template.print('</a>');
})(current, template, email, email_action, event);
