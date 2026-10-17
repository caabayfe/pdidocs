function onSubmit() {
	if(g_user.hasRole("admin"))
		return true;
	
	if(!g_form.hasField("user"))
		return true;
	
	if(g_form.getValue("user") != g_user.userID) {
      g_form.addErrorMessage("Invalid insert");
      return false;
	} else
		return true;
}
