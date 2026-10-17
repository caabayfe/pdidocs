
(function revertToStoreApp() {
	action.setRedirectURL(current);
	var suv = new GlideappUpdateVersion();
	suv.revertToStoreApp(current.sys_update_name, current.sys_scope);
})();
