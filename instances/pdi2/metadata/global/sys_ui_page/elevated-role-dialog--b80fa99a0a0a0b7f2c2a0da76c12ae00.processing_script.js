setElevatedRoles();

function setElevatedRoles() {
	var sm = GlideSecurityManager.get();
	var elevatedRoles = sm.getAvailableElevatedRoles();
	// disable elevated roles first, next, enable the ones that are checked
	for(i = 0; i < elevatedRoles.size(); i++) {
		var r = elevatedRoles.get(i);
		
		if (isEnabled(r)) {
			if (!sm.hasRole(r)) {
				gs.eventQueue("security.elevated_role.enabled", null, gs.getUserName(), r);
				sm.enableElevatedRole(r);
			}
		} else {
			if (sm.hasRole(r)) {
				gs.eventQueue("security.elevated_role.disabled", null, gs.getUserName(), r);
				sm.disableElevatedRole(r);
			}
		}
	}
	
	// Redirect to the current page in gsft_main
	if (typeof gsft_main_url != "undefined")
		response.sendRedirect('nav_to.do?uri=' + gsft_main_url);
	else
		response.sendRedirect('./navpage.do');
}

function isEnabled(role) {
	if (typeof elevated_roles != "undefined") {
		
		var ers = elevated_roles.split(",");
		for(j = 0; j < ers.length; j++) {
			var r = ers[j];
			if (role == r)
				return true;
		}
	}
	
	return false;
}
