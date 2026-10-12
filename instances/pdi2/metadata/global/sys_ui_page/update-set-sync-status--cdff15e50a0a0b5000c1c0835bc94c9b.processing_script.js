// if we are here, we have hit the cancel button

// update run histoy as cancelled
var irgr = new GlideRecord("sys_import_set_run");
irgr.addQuery("sys_id", run_history_sysid);
irgr.query();
if (irgr.next()) {
  irgr.state = "cancelled";
  irgr.update();
}

var pm = new GlideProgressMonitor(pworker_sysid);
pm.cancel();
pm.waitForCompletionOrTimeout(60);

response.sendRedirect("import_status.do?sysparm_pworker_sysid=" + pworker_sysid);
