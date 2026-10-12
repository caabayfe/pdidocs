answer = (function() {
	if (gs.hasRole('admin'))
		return true;
	var sysAppGr = new GlideRecord('sys_app');
	sysAppGr.get(gs.getCurrentApplicationId());
	return sysAppGr.canDelete();
})();
