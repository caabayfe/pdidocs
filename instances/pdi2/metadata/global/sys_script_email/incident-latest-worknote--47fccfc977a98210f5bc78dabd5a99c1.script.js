(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    // Add your code here
    var notificationUtil = new IncidentNotificationUtil();
    var worknote = notificationUtil.getLatestCommentOrWorkNotes(current.getTableName(), current.getUniqueValue(), 'work_notes');
    template.print('<div style="text-align: center; line-height: 36px; padding-bottom: 24px; border-bottom: 1px solid #DADDE2;"><span style="font-size: 24px; font-weight: 600; color: #181A1f;">' + worknote.user + ' added work notes to incident</span></div>');
    template.print('<div style="font-size: 16px; padding-top: 24px; padding-bottom: 16px; color: #181A1F"><span style="font-weight: 700;">' + worknote.user + ' </span>');
    template.print('<span style="font-weight: 400;">left work notes on </span>');
    template.print('<span style="font-weight: 700;">${number}:</span></div>');
    template.print('<span style="font-weight: 600;color: #181A1F">' + worknote.val + '</span>');

})(current, template, email, email_action, event);
