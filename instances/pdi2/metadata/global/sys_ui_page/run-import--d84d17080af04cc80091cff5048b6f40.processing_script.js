var runHistorySysID = ""; // set in transform(...)

var pworker_sysid = transform(transform_map_list);
redirectToProgressWorker(pworker_sysid);


// -----------------------------

function transform(mlist) {
  var t = new GlideImportSetTransformerWorker(import_set, mlist);
  t.setBackground(true);
  t.start();

  var id = t.getProgressID();
  waitForStartup(id);
  runHistorySysID = t.getImportSetRun().getImportSetRunSysID();
  return id;
}

function waitForStartup(id) {
  // cut down on the chances we will see the starting message
  var pm = new GlideProgressMonitor(id);
  var seconds = gs.getProperty("glide.run_import.startup", 30);
  pm.waitForCompletionOrTimeout(seconds);
}

function redirectToProgressWorker(pworker_sysid) {
  var redirect = "import_status.do?sysparm_pworker_sysid=" + pworker_sysid;
  redirect += "&sysparm_run_history=" + runHistorySysID;
  response.sendRedirect(redirect);
}
