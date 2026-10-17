var converter = new EmailNotificationConverter();
converter.convertTemplateToVersion2(current);
if (! current.isActionAborted())
    action.setRedirectURL(current);
