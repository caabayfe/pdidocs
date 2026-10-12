run();

function run() {
	var gr = new GlideRecord('pwd_verification');
	gr.addQuery('type', current.sys_id);
	gr.query();
	if (gr.next()) {
		current.setAbortAction(true);
		errMsg = gs.getMessage("Cannot delete the verification type because it is used by one or more verifications");
		gs.addErrorMessage(errMsg);
	}
}
