function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (newValue === '') {
		return;
	}
	
	if (newValue == "credential") {
		g_form.showRelatedList("discovery_credentials");
		g_form.hideRelatedList("sys_connection");	   
		g_form.hideRelatedList("connection_attributes");
		g_form.hideRelatedList("sys_alias");
	}
	else {
		g_form.showRelatedList("sys_connection");
		if (g_form.getValue("parent")) {
			g_form.hideRelatedList("sys_alias");
			g_form.hideRelatedList("connection_attributes");
		} else {
			g_form.showRelatedList("connection_attributes");
			g_form.showRelatedList("sys_alias");
		}
		g_form.hideRelatedList("discovery_credentials");
	}	
}
