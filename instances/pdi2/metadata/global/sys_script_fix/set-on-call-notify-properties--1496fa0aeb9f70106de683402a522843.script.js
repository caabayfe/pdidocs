(function() {
	if (GlidePluginManager.isZboot())
		return;
	var prevWF = gs.getSession().getWorkflow();
	try {
		gs.getSession().setWorkflow(true);
		gs.setProperty('com.snc.on_call_rotation.notification.voice.use_notify_call', false);
	}
	finally{
		gs.getSession().setWorkflow(prevWF);
	}
})();
