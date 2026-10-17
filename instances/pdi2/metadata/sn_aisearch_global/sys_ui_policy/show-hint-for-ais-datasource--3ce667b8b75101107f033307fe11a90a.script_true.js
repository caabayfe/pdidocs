function onCondition() {
	var msg = "Indexed source records indicate which source tables are tracked in the search index. ";
		
	if (g_form.getValue('operation') == 'insert')
		msg = msg + "A new indexed source will be created with the values shown in the AI Search Migration Staging Record Changes related list.";

	g_form.addInfoMessage(msg);

	g_form.addErrorMessage('Creating an indexed source is a form of customization that will not be changed on upgrade. Accepting this change will transfer ownership to you.');
}
