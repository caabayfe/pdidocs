answer = false;
var uid = gs.getUserID();
var ideUtils = new sn_glider.ACLSupport();
if (current.user.sys_id == uid || ideUtils.isSecurityAdmin()) {
	answer = true;
}
