var answer = false;
var isCreateReportEnabled = gs.getProperty('com.snc.par.coreui.report_create.enabled', 'false');
if (isCreateReportEnabled == 'true') {
    var userID = current.user.toString();

    var isGlobal = userID == "GLOBAL";

    if (gs.hasRole('report_admin'))
        answer = true;
    else if (isGlobal)
        answer = gs.hasRole('report_global');
    else if (current.user == 'group')
        answer = gs.hasRole('report_group');
    else
        answer = gs.hasRole(current.roles);
}
