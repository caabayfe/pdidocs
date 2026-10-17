function onLoad() {
	var objView = g_form.getElement('sysparm_view');
	var strView = objView.getAttribute('value'); 
	if (strView == "notification_preference" ) {
		g_form.setReadOnly("notification", true);
		g_form.setReadOnly("device", true);
	}
   
}
