(function runMailScript(current, template, email, email_action, event) {

    if (!current.isValidRecord()) return;

    var link = new EmailNotificationRedirection().getLink(current.getTableName(), current.getUniqueValue());
    template.print('<a href="' + link + '">' + current.getDisplayValue() + '</a>');

})(current, template, email, email_action, event);
