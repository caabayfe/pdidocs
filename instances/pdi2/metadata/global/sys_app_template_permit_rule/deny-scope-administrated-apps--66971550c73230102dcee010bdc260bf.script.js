(function (/*String */ sysId) {

	var sysApp = new GlideRecord("sys_app");
	if (!sysApp.get(sysId))
		return true; // deny templatization because the app hasn't been found
	
	var isScopedAdministrationEnabled = sysApp.getValue("scoped_administration");
	
	// getValue on a boolean/true/false field returns an "0" (false) or "1" (true)
	if ("1" === isScopedAdministrationEnabled) {
		return 'deny';
	}
	
	return 'allow';

})(sysId);
