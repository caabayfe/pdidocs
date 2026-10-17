// if we are here, we have hit the cancel button.
gs.log('Cancelling progres worker: ' + worker_id);
var pm = new GlideProgressMonitor(worker_id);
pm.cancel();
pm.waitForCompletionOrTimeout(1);

var redirect = "pwd_test_cred_store_connection_status.do?sysparm_pworker_sysid=" + worker_id;
response.sendRedirect(redirect);
