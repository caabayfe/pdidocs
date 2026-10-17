function onLoad() {
   //Type appropriate comment here, and begin script below
	if(!g_user.hasRole("admin") && !g_user.hasRole("usage_admin") ) {
		//hide the list
		g_form.hideRelatedList("sys_user_has_license.user");
	}
	g_form.hideRelatedList("REL:b31dbb025b3012002eff8405f0f91a67");
}
