current.update();
(new ContractManagementUtils()).updateTermsAndConditions(current.sys_id);
var inputURL = String(gs.action.getGlideURI());
if (inputURL.indexOf('.do?') !== -1) {
	action.setRedirectURL(current);
}
