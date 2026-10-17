function onLoad() {
var objView = g_form.getElement('sysparm_view');
	var strView = objView.getAttribute('value'); 
	if (strView == "push_notification" && g_form.isNewRecord()) {
		g_form.setValue("push_message_only", "true");
		g_form.setReadOnly("push_message_only", true);
	}
   
}
