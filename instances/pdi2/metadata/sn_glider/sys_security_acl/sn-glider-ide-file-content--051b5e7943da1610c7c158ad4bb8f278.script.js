answer = false;
var uid = gs.getUserID();
var ideUtils = new sn_glider.ACLSupport();
if (current.isValidRecord() && (ideUtils.isSecurityAdmin() || ideUtils.canAccessFileContent(uid, current.checksum))) {
	answer = true;
}
