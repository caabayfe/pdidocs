// if we are here, we have hit the cancel button.
var pm = new GlideProgressMonitor(pworker_sysid);
pm.cancel();
pm.waitForCompletionOrTimeout(60);

response.sendRedirect("rebuild_jrobin_databases_status.do?sysparm_pworker_sysid=" + pworker_sysid);
