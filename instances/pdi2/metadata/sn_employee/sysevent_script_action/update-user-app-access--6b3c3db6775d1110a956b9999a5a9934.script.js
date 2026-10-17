var params = JSON.parse(event.parm1);
var appName = params.appName;
var action = params.action;
var condition = params.condition;
var criteriaTableName = params.criteriaTableName;
var accessManagement = new sn_employee.ep_AccessManagement(appName);

switch (action) {
    case accessManagement.CREATE_ACTION:
        accessManagement.createAccess(condition, criteriaTableName);
        break;

    case accessManagement.GRANT_ACTION:
        accessManagement.grantAccess(condition, criteriaTableName);
        break;

    case accessManagement.REVOKE_ACTION:
        accessManagement.revokeAccess();
        break;

    case accessManagement.SYNC_PROFILE_ACTION:
        accessManagement.syncProfiles();
        break;

    default:
        gs.warn(accessManagement.ACTION_EVENT_NAME + "Unknon action in Update user app access");
}
