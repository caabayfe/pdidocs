function onLoad() {
var objView = g_form.getElement('sysparm_view');
	var strView = objView.getAttribute('value'); 
	if ((strView == "forward-received") || (strView == "reply-received") || (strView == "replyall-received") 
		||(strView == "forward-sent") || (strView == "reply-sent") || (strView == "replyall-sent"))
	{
		g_form.setReadonly('name', true);
		g_form.setValue('table','sys_email');
		g_form.setReadonly('table', true);
	}
}
