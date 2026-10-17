(function() {
	if (GlidePluginManager.isZboot())
		return;
	var prevWF = gs.getSession().getWorkflow();
	try {
		gs.getSession().setWorkflow(true);
		gs.setProperty('com.snc.problem.create_from_interaction.save', false);
	}
	finally{
		gs.getSession().setWorkflow(prevWF);
	}
})();
