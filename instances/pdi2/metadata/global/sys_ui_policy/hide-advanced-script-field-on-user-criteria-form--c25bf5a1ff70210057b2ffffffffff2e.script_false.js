function _showSysScriptAdvancedControls() {		
	g_form.setDisplay('script', true);		
}

function onCondition() {
	var e = g_form.getControl('advanced');
	if (e) {
		_showSysScriptAdvancedControls();
	} else {
		// this block will execute if the control is not on the form
		_hideSysScriptAdvancedControls();
	}		
}
