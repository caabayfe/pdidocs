function onCondition() {
	if(g_scratchpad.isFactTableRotation)
		g_form.addInfoMessage(getMessage('Performance Analytics does not support rotation tables. Collection based on those tables will not be accurate.'));
}
