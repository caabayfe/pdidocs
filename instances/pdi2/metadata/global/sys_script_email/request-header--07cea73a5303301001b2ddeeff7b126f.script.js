(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var notificationUtil = new RequestNotificationUtil();
    var salutation = notificationUtil.setGreetingsMessage(current, email_action);
    template.print(salutation);

})(current, template, email, email_action, event);
