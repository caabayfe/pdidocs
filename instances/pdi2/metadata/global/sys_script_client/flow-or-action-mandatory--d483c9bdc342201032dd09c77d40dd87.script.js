function onSubmit() {
   //Type appropriate comment here, and begin script below
	var actionNil = g_form.getValue('action') == '';
	var flowNil = g_form.getValue('flow') == '';
	if(actionNil && flowNil) {
		g_form.addErrorMessage(getMessage(" One of Flow or Action must be given."));
		return false;
	} else if (!actionNil && !flowNil) {
		g_form.addErrorMessage(getMessage("Only one of Flow or Action must be given."));
		return false;
	}

    return true;
}
