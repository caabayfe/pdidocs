(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var notificationUtil = new global.ProminMLNotificationUtil(current);
    email.setSubject(notificationUtil.getEmailSubjectForMLNotification(event));
    template.print(notificationUtil.getEmailContentForMLNotification(template));

})(current, template, email, email_action, event);
