function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue == '') {
		return;
	}

	//Type appropriate comment here, and begin script below
	if(newValue == 'false'){
		var msg = getMessage("Order cannot be checked out by hiding this button.");
		g_form.showFieldMsg(control, msg, "warning");
	}
	else
		g_form.hideFieldMsg(control, "true");
}
