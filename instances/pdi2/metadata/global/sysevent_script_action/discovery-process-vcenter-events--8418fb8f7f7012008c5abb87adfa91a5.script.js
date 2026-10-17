(function() {
	var originalUser = gs.getSession().impersonate(event.user_id);
	try {
		VCenterVmStateUpdater.process(event.instance, event.parm1, event.parm2);
	} finally {
		gs.getSession().impersonate(originalUser);
	}
}());
