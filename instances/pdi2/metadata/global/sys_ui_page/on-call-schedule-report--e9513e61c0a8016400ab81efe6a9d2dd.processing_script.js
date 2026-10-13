// skip generating the rotations if running the formatted schedule report.
var hasGroups = checkHasGroups();
if (report_style == 'formatted' && hasGroups) {
    // send user to formatted report UI page with parameters if we have groups,
    // otherwise redirect back set the date range to be from now to the end of next month (if not already set)
    if (!start_date)
        start_date = gs.now();

    if (!end_date)
        end_date = gs.now();

    response.sendRedirect(new OCRotation().formattedReportUrl(start_date, end_date, groups));
} else if (hasGroups)
    response.sendRedirect(new OCRotation().vRotationHandling(start_date, end_date, groups));

function checkHasGroups() {
    // check for a group id - if we don't have one, we need to ask for one
    if ((typeof groups == 'undefined') || !groups) {
        gs.addErrorMessage(gs.getMessage("Please select at least one group for the report"));
        response.sendRedirect('ui_page.do?name=on_call_schedule_report&start_date=' + start_date + "&end_date=" + end_date);
        return false;
    }
    return true;
}
