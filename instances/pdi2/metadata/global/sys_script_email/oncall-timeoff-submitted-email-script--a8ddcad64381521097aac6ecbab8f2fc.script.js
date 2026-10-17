(function runMailScript( /* GlideRecord */ current, /* TemplatePrinter */ template,
    /* Optional EmailOutbound */
    email, /* Optional GlideRecord */ email_action,
    /* Optional GlideRecord */
    event) {
    var openedBy = current.opened_by.name;
    var startDateTime = new OCRosterSpanApprovalUtil().getFromDateDisplayValuePerSpanProposal(current);
    var endDateTime = new OCRosterSpanApprovalUtil().getToDateDisplayValuePerSpanProposal(current);
    var args = [];
    args.push(startDateTime);
    args.push(endDateTime);
    var text = gs.getMessage('Dear {0},', openedBy);
    var listLineOne = gs.getMessage('Your request for time off request for {0} to {1} has been submitted.', args);
    var listLineTwo = gs.getMessage("Thank you");
    template.print("<p>" + text + "</p>" + "<p>" + listLineOne + "</p>" + "<p>" + listLineTwo + "</p>");
})(current, template, email, email_action, event);
