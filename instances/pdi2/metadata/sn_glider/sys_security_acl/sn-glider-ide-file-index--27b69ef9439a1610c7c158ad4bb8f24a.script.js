answer = false;
var uid = gs.getUserID();
var ideUtils = new sn_glider.ACLSupport();
if (current.isValidRecord() && (ideUtils.canAccessFileIndex(uid, current.uri) || ideUtils.isSecurityAdmin())) {
	answer = true;
}
