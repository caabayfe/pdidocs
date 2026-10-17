rewriteDemoData();

function rewriteDemoData() {	
	var worker = new GlideScriptedProgressWorker();
	worker.setProgressName("Rewrite demo data");
	worker.setName('EMRewriteDemoDataWorker');
	worker.addParameter(current.sys_id);
	worker.setBackground(true);
	worker.start();
	
	var redirect = "register_plugin_status.do?sysparm_pworker_sysid="+ worker.getProgressID() + "&sysparm_plugin_id=" + current.sys_id;
	action.setRedirectURL(redirect);
}
