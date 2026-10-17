(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var result = new ActivityMentionEmailValues().getEmailValues(current.table, current.document);
    if (result) {
        result = JSON.parse(result);
        email.setSubject(gs.getMessage("You have been mentioned in {0}", result.subjectText));
        template.print("<p style='color: #424E5B;margin: 0 0 12px;line-height: 26px;margin-bottom: 12px'>");
        template.print(gs.getMessage("You have been mentioned by {0} in", current.user_from.name));
        template.print("&nbsp;<a href='/nav_to.do?uri=" + result.className + ".do?sys_id=" + result.recordSysId + "'>" + result.linkText + "</a></p>");
    }

})(current, template, email, email_action, event);
