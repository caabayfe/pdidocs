  var worker = new GlideScriptedProgressWorker();
  worker.setProgressName("Move audit data into rotations ");
  worker.setName('TransferAuditToRotations');
  worker.addParameter("Made it to the start");
  worker.setBackground(true);
  worker.start();
  gs.setRedirect("transfer_audit_refresh.do?sysparm_pworker_sysid=" + worker.getProgressID());
