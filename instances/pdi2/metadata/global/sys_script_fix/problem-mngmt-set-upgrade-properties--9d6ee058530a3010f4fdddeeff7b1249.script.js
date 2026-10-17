(function() {
	if (GlidePluginManager.isZboot())
		return;
	var prevWF = gs.getSession().getWorkflow();
	try {
		gs.getSession().setWorkflow(true);
		gs.setProperty("problem.role.relate_closed_incidents", "-nobody-");
		gs.setProperty('com.snc.problem.create_from_incident.copy_attachments', false);
	}
	finally{
		gs.getSession().setWorkflow(prevWF);
	}
})();
