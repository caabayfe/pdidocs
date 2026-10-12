var answer = false;
var pdACLUtils = new global.PDACLUtils();
var padConstants = global.PADConstants;
if (pdACLUtils.userHasRole(padConstants.ROLES.MAINT_ROLE) || pdACLUtils.userHasRole(padConstants.ROLES.PLAYBOOK_WRITE_PUBLIC_ACCESS)) {
    answer = true;
}
