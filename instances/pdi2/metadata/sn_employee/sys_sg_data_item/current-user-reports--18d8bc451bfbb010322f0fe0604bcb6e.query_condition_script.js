(function getQueryString(input) {
    var reports = new sn_employee.EP_MyTeamsUtils().getCurrentUserReports(input);
    if (reports.length > 0) {
        return reports;
    }
    return "sysuser_sys_idIN";
})(input);
