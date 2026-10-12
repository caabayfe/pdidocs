function onLoad() {
   //Type appropriate comment here, and begin script below
	var user = g_form.getValue("user");
	if (user.length == 0) {
		g_form.setValue("user", g_user.userID);
	}
   
}
