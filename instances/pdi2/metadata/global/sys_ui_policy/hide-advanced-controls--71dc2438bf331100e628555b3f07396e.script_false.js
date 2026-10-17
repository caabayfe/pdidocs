function _showSysScriptAdvancedControls() {
	g_form.setVisible('when', true);
	g_form.setVisible('order', true);
	if (g_form.getValue('collection') != 'global' && g_form.getValue('when') != 'before_display') {
		g_form.setDisplay('action_delete', true);
		g_form.setDisplay('action_query', true);
	}
	g_form.setSectionDisplay('advanced', true);
	
	if(g_form.getValue('abort_action') === 'false')
		g_form.setDisplay('script', true);		

}

function onCondition() {
	var e = g_form.getControl('advanced');
	if (e) {
		_showSysScriptAdvancedControls();
	} else {
		// this block will execute if the control is not on the 
		// form, which is the case for BE
		_hideSysScriptAdvancedControls();
	}		
}
