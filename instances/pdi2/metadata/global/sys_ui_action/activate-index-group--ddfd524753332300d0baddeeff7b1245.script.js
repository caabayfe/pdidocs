function showActivationPopup(){
	var tables = g_form.getValue('tables').split(',');
	var grAjax = new GlideAjax('TSConfigurationAjax');
	grAjax.addParam('sysparm_name', 'getMigrationNeededTablesInIndexGroup');
	grAjax.addParam('sysparm_tables', g_form.getValue('tables'));
	grAjax.getXML(function(response) {
		var tables = response.responseXML.documentElement.getAttribute("answer");
		if (tables)
			alert(new GwtMessage().getMessage('Please migrate {0} first before activating index group', tables));
		else {
			var group = g_form.getValue("name");
			var gDialog = new GlideDialogWindow("dialog_text_index_active_index_group");
			gDialog.setSize(400, 188);
			gDialog.setPreference("group_name", group);
			gDialog.setTitle('Activate Text Index Group');
			gDialog.render();
		}	
	});
}
