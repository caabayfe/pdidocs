function _hideSysScriptAdvancedControls() {
	g_form.setVisible('when', false);
	g_form.setVisible('order', false);
	g_form.setDisplay('script', false);		
	g_form.setDisplay('action_delete', false);		
	g_form.setDisplay('action_query', false);		
	
	g_form.setSectionDisplay('advanced', false);
}

function onCondition() {
	_hideSysScriptAdvancedControls();
}
