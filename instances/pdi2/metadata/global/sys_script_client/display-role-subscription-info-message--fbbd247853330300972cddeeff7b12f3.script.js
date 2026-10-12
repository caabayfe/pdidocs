function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	
   var targetDisplay = g_form.getDisplayBox('user_role'); 
	var usrRole = targetDisplay.getValue();
	
    if (isLoading) {
        return;
    }
	
	//Set the field visibility based on the role existence
	if (roleRequiresSubscription(usrRole)) {
		g_form.showFieldMsg('user_role', getMessage('This role is linked to a subscription requirement'), 'info');
	}
	
	if ((newValue == '') || (newValue == null) || (typeof newValue == 'undefined'))
		return;
}

function roleRequiresSubscription(role) {
	
	if ((role == '') || (role == null) || (typeof role == 'undefined'))
		return false;
	
	var gR = new GlideRecord("sys_user_role");
		gR.addQuery("name", role);
		gR.query();

	if (gR.next()) {
		if (gR.getValue("requires_subscription") == "1")
			return true;
	}

	return false;
}
