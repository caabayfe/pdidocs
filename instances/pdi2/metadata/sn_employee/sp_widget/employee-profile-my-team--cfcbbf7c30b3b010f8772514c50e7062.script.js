data.limitTo = 3;
data.user_id = gs.getUserID();

data.isMobile = gs.isMobile();

data.sysUserID = $sp.getParameter("sys_id");
var loggedInSysUserID = gs.getUser().getID();

if (!data.sysUserID)
    data.sysUserID = loggedInSysUserID;

data.content = options;
// widgetTitle will consider tab widget mapping table name attribute.
data.widgetTitle = data.content.widgetTitle;
var sysUserGR = new GlideRecord("sys_user");
data.userExists = sysUserGR.get(data.sysUserID) && sysUserGR.canRead();

if (data.userExists) {
    sysUserGR.get(data.sysUserID);
}

data.isLoggedInUsersProfile = loggedInSysUserID.equals(data.sysUserID);

data.directReports = [];
data.teamData = {};
data.teamData.direct_reports = [];
data.teamData.members = [];
data.teamData.dotted_managers = [];
data.teamData.dotted_reports = [];

if (!data.isLoggedInUsersProfile) {
    data.teamData.user = {
        sys_id: data.sysUserID
    };
}
var epUtils = new sn_employee.EP_MyTeamsUtils();

var manager = epUtils.getManager(sysUserGR);
if (manager)
    data.teamData.manager = buildUser(manager);

//Calculate team
if (data.teamData.manager) {
    var teamGR = epUtils.getTeamMembers(sysUserGR);
    while (teamGR.next())
        data.teamData.members.push(buildUser(teamGR));
}

//Calculate direct reports
var directReportsGR = epUtils.getDirectReports(sysUserGR);
while (directReportsGR.next())
    data.teamData.direct_reports.push(buildUser(directReportsGR));

if (epUtils.isEntitled()) {
    //Calculate dotted managers
    var dottedManagersGr = epUtils.getDottedManagers(sysUserGR);
    while (dottedManagersGr.next())
        data.teamData.dotted_managers.push(buildUser(dottedManagersGr.secondary_manager.user.getRefRecord()));

    //Calculate dotted Reports
    var dottedReportsGr = epUtils.getDottedReports(sysUserGR);
    while (dottedReportsGr.next())
        data.teamData.dotted_reports.push(buildUser(dottedReportsGr.employee.user.getRefRecord()));
}


data.publicProfileWidget = $sp.getWidget('public_profile_visibility', {
    'tabWidgetMappingId': data.content ? data.content.tabWidgetMappingId : '',
    'isUserSelectionEnabled': data.content ? data.content.isUserSelectionEnabled : '',
    'widgetTitle': data.content ? data.content.widgetTitle : ''
});

function buildUser(userGR) {
    var pronoun = '';
    var employeeGr = new GlideRecord('sn_employee_profile');
    employeeGr.addQuery('user', userGR.getValue("sys_id"));
    employeeGr.query();

    if (employeeGr.next() && employeeGr.getValue('preferred_pronoun')) {
        var portalUtils = new sn_employee.ep_portalUtil(userGR.getValue("sys_id"));
        if (portalUtils.isFieldPublic('preferred_pronoun'))
            pronoun = ' (' + employeeGr.getDisplayValue('preferred_pronoun') + ')';
    }

    return {
        email: userGR.getValue("email") || "",
        first_name: userGR.getValue("first_name"),
        last_name: userGR.getValue("last_name"),
        name: userGR.getValue("name"),
        phone: userGR.getValue("phone") || "",
        sys_id: userGR.getValue("sys_id"),
        pronoun: pronoun || '',
        title: userGR.getValue('title'),
        department: userGR.getDisplayValue('department')
    };
}
