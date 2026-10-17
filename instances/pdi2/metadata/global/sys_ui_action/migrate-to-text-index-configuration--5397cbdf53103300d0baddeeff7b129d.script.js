function migrateToTextIndexConfiguration() {
	var tableName = g_form.getValue("table");
	var ga = new GlideAjax('TSConfigurationAjax');
	ga.addParam('sysparm_name', 'isSameScope');
	ga.addParam('sysparm_table', tableName);
	ga.getXML(function(response) {
		var answer = response.responseXML.documentElement.getAttribute("answer");
		answer = JSON.parse(answer);
		if (answer.isSameScope) {
			var gDialog = new GlideDialogWindow("dialog_text_index_migrate_to_ts_configuration");
			gDialog.setSize(400, 200);
			gDialog.setPreference("table_name", tableName);
			gDialog.setTitle('Migrate to Text Index Configuration');
			gDialog.render();
		} else
			alert(new GwtMessage().getMessage("The '{0}' table is in application '{1}', but the current application is '{2}'. Please change application to '{3}' before migrating.", tableName, answer.tableScope, answer.userScope, answer.tableScope));
	});
}
