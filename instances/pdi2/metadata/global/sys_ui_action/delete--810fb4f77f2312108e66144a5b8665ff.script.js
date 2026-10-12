function confirmAndDeleteDefinition() {
	var DEFAULT_POLICY_TABLE = "cmdb_ci";
	var ACTIVE = 'active';
	var TABLE_COL = 'table';
	var TRUE = "true";

	if (g_form.getValue(ACTIVE) == TRUE) {
		g_form.addErrorMessage(getMessage("Active definition cannot be deleted."));
		return;
	}
	if (g_form.getValue(TABLE_COL) == DEFAULT_POLICY_TABLE) {
		g_form.addErrorMessage(getMessage("Default definition cannot be deleted."));
		return;
	}
	var definitionId = g_form.getUniqueValue();

	var ga = new GlideAjax('CMDBCustomRetirmentDefinitionUtil');
        ga.addParam('sysparm_name', 'isLastButOneRetirementDefinition');
        ga.addParam('definitionId', definitionId);
    
        ga.getXMLAnswer(function(response) {
	var isLastButOneDefinition = (response === TRUE);
	var dlg = new GlideDialogWindow('delete_retirement_definition_confirm_form');
	dlg.setTitle("");
	dlg.setWidth(500);
	dlg.setPreference('sysparm_definition_id', definitionId);
	dlg.setPreference('sysparm_last_but_one', String(isLastButOneDefinition));
	dlg.setPreference('sysparm_table', g_form.getTableName());
	dlg.render();
    });
	
}
