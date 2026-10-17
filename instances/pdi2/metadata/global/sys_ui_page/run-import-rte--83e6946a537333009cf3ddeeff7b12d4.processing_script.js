var runHistorySysID = ""; // set in transform(...)

var pworker_sysid = transform();
redirectToProgressWorker(pworker_sysid);


// -----------------------------

function transform() {
  var t = new GlideImportSetTransformerWorker(iset_sys_id, "");
  t.setBackground(true);
  t.start();

  var id = t.getProgressID();
  waitForStartup(id);
  runHistorySysID = t.getImportSetRun().getImportSetRunSysID();
  return id;
}

function waitForStartup(id) {
  var pm = new GlideProgressMonitor(id);
  var seconds = gs.getProperty("glide.run_import.startup", 30);
  pm.waitForCompletionOrTimeout(seconds);
}


function redirectToProgressWorker(pworker_sysid) {
  var redirect = "import_status.do?sysparm_pworker_sysid=" + pworker_sysid;
  redirect += "&sysparm_run_history=" + runHistorySysID;
  response.sendRedirect(redirect);
}
