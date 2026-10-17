function onCondition() {
	//Resolve reference to a value of application_scope field without sending AJAX request to server
	var valueArray = new Array(g_form.getValue('application'));
    var labelArray = new Array(g_form.getValue('application_name'));
    g_form.setValue("application", valueArray, labelArray);
	//Make sure application_scope field is hidden
	g_form.setVisible('application_scope', false);
}
