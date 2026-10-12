(function executeRule(current, previous /*null when async*/) {

	var credFields = [
		'password', 'ssh_private_key', 'ssh_passphrase', 'authentication_key', 'privacy_key','credential_storage_vault'
	];

	var credData = {};
	for (var i = 0; i < credFields.length; i++) {
		var currField = credFields[i];
		var fieldValue = current.getValue(currField);
		if (JSUtil.nil(fieldValue))
			continue;

		credData[currField] = {
			'value': fieldValue,
			'decrypt': true
		};
	}

    // Check if External Credential Storage plugin is active.
    if (GlidePluginManager.isActive('com.snc.discovery.external_credentials')) {
        //handle credential storage vault
        var gr = new GlideRecord('vault_configuration');
        if (gr.get(current.getValue('credential_storage_vault'))) {
            var name = gr.getValue('name');
            credData['credential_storage_vault.name'] = {
                'value': name,
                'decrypt': true
            };

			credData['credential_storage_vault.fqcn'] = {
                'value': gr.getValue('fqcn'),
                'decrypt': true
            };
        }
    }

	// add type since its not visible on the form
	credData.type = {'value': current.getValue('type'), 'decrypt': false};
	g_scratchpad.credData = credData;
	g_scratchpad.discAzureCBAEnabled = gs.getProperty('glide.discovery.azure.cba.enabled') === 'true';
})(current, previous);
