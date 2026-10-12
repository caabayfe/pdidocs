function testCredential() {
	// Grab the original credential data from the server
	var credData = {};
	for (var attr in g_scratchpad.credData) {
		if (g_scratchpad.credData.hasOwnProperty(attr))
			credData[attr] = g_scratchpad.credData[attr];
	}

	if ((credData.type.value === 'aws') && g_form.isNewRecord()) {
		g_form.addErrorMessage("AWS credentials must be saved before testing");
		return false;
	}

	// Update credential data with any changed values from the form
	for (var idx = 0; idx < g_form.elements.length; idx++) {
		var fieldName = g_form.elements[idx].fieldName;
		if (!credData[fieldName] || (credData[fieldName] && g_form.getControl(fieldName).changed)) {
			credData[fieldName] = {
				'value': g_form.getValue(fieldName),
				'decrypt': false
			};
			// We need to add storage vault display name
			// Mid will process credential_storage_vault.name filed in credential
			// data field to test credential
			if (fieldName === 'credential_storage_vault') {
				var vaultRef = g_form.getReference('credential_storage_vault');
				if (vaultRef != null) {
					fieldName = 'credential_storage_vault.name';
					credData[fieldName] = {
						'value': vaultRef.getValue('name'),
						'decrypt': false
					};
					fieldName = 'credential_storage_vault.fqcn';
					credData[fieldName] = {
						'value': vaultRef.getValue('fqcn'),
						'decrypt': false
					};
				}
			}
		}
	}

	var dialogClass = window.GlideModal ? GlideModal : GlideDialogWindow;
	var dialog = new dialogClass("test_credential");
	var gwt = new GwtMessage();
	dialog.setTitle(gwt.getMessage("Test Credential"));
	dialog.setSize(350,300);
	dialog.setPreference("cred_type", credData.type.value);
	dialog.setPreference("cred_data", JSON.stringify(credData));
	dialog.setPreference("cred_table", g_form.getTableName());
	dialog.setNologValue(true);
	dialog.render();
}
