(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {

    var rosterSpanProposalGr = new GlideRecord("roster_schedule_span_proposal");
    if (rosterSpanProposalGr.get(current.document_id + "")) {
        var rosterSpan = rosterSpanProposalGr.roster_schedule_span;
        var contextualDate = new GlideScheduleDateTime(rosterSpan.start_date_time.getGlideObject())
            .getGlideDateTime();
        var emailNotifRedirect = new global.EmailNotificationRedirection();
        var params = {
            "approval_sys_id": current.getUniqueValue(),
            "group": rosterSpan.group + "",
            "context_date": contextualDate
        };
        var url = emailNotifRedirect.getLink(null, null, "oc_approval", params);
        var link = "<a href='" + url + "'>" + gs.getMessage("LINK") + "</a>";
        template.print(gs.getMessage("Click here to view Approval Request: {0}", link));
    }

})(current, template, email, email_action, event);
