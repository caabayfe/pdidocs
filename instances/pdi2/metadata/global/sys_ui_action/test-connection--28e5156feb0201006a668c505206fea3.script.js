//current.update();

if (current.type.nil()) {
	gs.addErrorMessage(gs.getMessage('Connection test failed because there was no credential store type attached to credential store.'));
	current.setAbortAction(true);
}
// if subworkflow is not provided exit
if (!current.type.use_flow && current.type.conn_test_wf.nil()) {
    gs.addErrorMessage(gs.getMessage('Connection test failed because there was no workflow specified in the Credential Store Type.'));
	current.setAbortAction(true);
}

// if flow is not provided exit
if (current.type.use_flow && current.type.conn_test_flow.nil()) {
    gs.addErrorMessage(gs.getMessage('Connection test failed because there was no flow specified in the Credential Store Type.'));
	current.setAbortAction(true);
}

// Setup and start worker
// NOTE:order of parameters should match
// function process definition of the worker
var worker = new GlideScriptedProgressWorker();
worker.setProgressName("Password Reset Credential Store Connection Test");
worker.setName('PwdTestCredStoreConnectionWorker');
worker.addParameter(current.sys_id);
worker.setBackground(true);
worker.start();

// Redirect
var redirect = "pwd_test_cred_store_connection_status.do?sysparm_pworker_sysid=" + worker.getProgressID();
redirect += "&sysparm_cred_store_id=" + current.sys_id;
action.setRedirectURL(redirect);
