(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var rosterSpan = current.roster_schedule_span;
    var contextualDate = new GlideScheduleDateTime(rosterSpan.start_date_time.getGlideObject())
        .getGlideDateTime();
    var emailNotifRedirect = new global.EmailNotificationRedirection();
    var params = {
        "view": "week",
        "group": rosterSpan.group + "",
        "context_date": contextualDate
    };
    var url = emailNotifRedirect.getLink(null, null, "oc_cal", params);
    var link = "<a href='" + url + "'>" + gs.getMessage("LINK") + "</a>";
    template.print(gs.getMessage("Click on the link to view your On-Call schedule: {0}", link));

})(current, template, email, email_action, event);
