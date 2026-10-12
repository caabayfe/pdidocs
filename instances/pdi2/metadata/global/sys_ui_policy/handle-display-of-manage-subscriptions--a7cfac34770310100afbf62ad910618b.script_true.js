function onCondition() {
	//Only show related list for Manage Subscription on group form for useres with admin, or usage_admin role
	if(!g_user.hasRole("admin") && !g_user.hasRole("usage_admin") ) {
		//hide the list
		g_form.hideRelatedList("license_group_has_subscription.group");
	}
}
