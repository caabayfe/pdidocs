(function(input) {
	var encryptionSetting = gs.getProperty('glide_encryption.cle_replatforming_with_kmf');
	var tableName;
	if (input)
		tableName = input.tableName;
	if ("opt_in" == encryptionSetting) {
		if (tableName)
			data.currentContext = gs.getSession().getCryptoModulePickerForTableWithSingleModule(tableName).getCurrent();
		else
			data.currentContext = gs.getSession().getCryptoModulePicker().getCurrent();
	} else {
		data.currentContext = gs.getSession().getEncryptionContext().getCurrent();
	}
	data.contexts = [];
	if (!data.currentContext)
		return;
	
	var contexts = new GlideChoiceList();
	var contextChoices;
	if ("opt_in" == encryptionSetting) {
		if (tableName)
			contextChoices = gs.getSession().getCryptoModulePickerForTableWithSingleModule(tableName).getChoices();
		else
			contextChoices = gs.getSession().getCryptoModulePicker().getChoices();
	} else {
		contextChoices = gs.getSession().getEncryptionContext().getChoices();
	}
	if (contextChoices != null)
		contexts = contextChoices.getSelected();
	data.index = -1;
	
	for (var i = 0; i < contexts.getSize(); i++) {
		var ch = contexts.getChoice(i);
		if (ch.getValue() == data.currentContext)
			data.index = i;
		data.contexts.push({label: ch.getLabel(), value: ch.getValue()});
	}
})(input);
