(function getQueryString(input) {
    var coworkersQueryString = new sn_employee.EP_MyTeamsUtils().getCurrentUserCoworkers(input);
    if (coworkersQueryString.length > 0) {
        return coworkersQueryString;
    }

    return 'sysuser_sys_idIN';
})(input);
