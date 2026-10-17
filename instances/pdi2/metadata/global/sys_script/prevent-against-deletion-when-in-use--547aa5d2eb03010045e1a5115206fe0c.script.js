run();

function run() {
	var gr = new GlideRecord('pwd_cred_store');
	gr.addQuery('type', current.sys_id);
	gr.query();
	if (gr.next()) {
		current.setAbortAction(true);
		errMsg = gs.getMessage("Cannot delete the credential store type because it is used by one or more credential stores");
		gs.addErrorMessage(errMsg);
	}
}
