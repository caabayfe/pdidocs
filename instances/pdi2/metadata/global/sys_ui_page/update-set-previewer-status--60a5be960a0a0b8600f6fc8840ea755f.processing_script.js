// if we are here, we have hit the cancel button.
var pm = new GlideProgressMonitor(pworker_sysid);
pm.cancel();
pm.waitForCompletionOrTimeout(60);

response.sendRedirect("update_set_previewer_status.do?sysparm_pworker_sysid=" + pworker_sysid);
