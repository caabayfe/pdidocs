
function onLoad() {
   //Type appropriate comment here, and begin script below
	
	if (g_form.getControl('group')) {
		g_form.setReadOnly('group', true);
		var msg = new GwtMessage().getMessage('The "{0}" field been deprecated and should not be used. Please use "{1}" instead.', 'group', 'groups');
		g_form.showFieldMsg('group', msg);
	}
   
}
