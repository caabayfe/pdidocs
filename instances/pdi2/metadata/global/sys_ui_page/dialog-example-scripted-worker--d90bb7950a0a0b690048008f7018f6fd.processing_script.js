if (cancelled == "true") {
  response.sendRedirect("home.do");
} else {
  var worker = new GlideScriptedProgressWorker();
  worker.setProgressName("Example Scripted Worker ");
  worker.setName('ExampleScriptedWorker');
  worker.addParameter("Made it to the start");
  worker.setBackground(true);
  worker.start();
  response.sendRedirect("example_scripted_worker_refresh.do?sysparm_pworker_sysid=" + worker.getProgressID());
}
