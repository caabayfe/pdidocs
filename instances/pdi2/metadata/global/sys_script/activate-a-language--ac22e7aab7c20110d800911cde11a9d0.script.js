(function executeRule(current, previous /*null when async*/) {
	var langId = current.id;

	if(sn_i18n.LanguageValidator.hasLanguagePlugin(langId)){
		var name = current.name.toLowerCase();
		name = name.replace(/ /g, '_');
		var id = 'com.snc.i18n.' + name;

		if (pm.getActivePlugin(id) == null) {
			current.setAbortAction(true);
			gs.addErrorMessage(sn_i18n.Message.getMessage("sn_i18n_core-activation", "Setting active=true does not load/upgrade the {pluginName} Language Plugin.  To activate this plugin please navigate to System Definition - Plugins.", {pluginName: current.name}));
		}
		else
			createOrActivateLanguageChoice(langId, String(current.name));
	}
	else {
		if(sn_i18n.LanguageValidator.validateId(langId))
			createOrActivateLanguageChoice(langId, String(current.name));
	}

	function createOrActivateLanguageChoice(value, label) {
		// First verify that the choice doesn't already exist
		var choice = new GlideRecord('sys_choice');
		choice.addQuery('name', 'sys_user');
		choice.addQuery('element', 'preferred_language');
		choice.addQuery('language', 'en');
		choice.addQuery('value', value);
		choice.query();
		if (choice.next()) {
			gs.info('Found a preferred_language for ' + value);
			choice.inactive = false;
			choice.update();
		} else {
			gs.info('No preferred_language for ' + value + ' in English. Creating one.');
			var choice2 = new GlideRecord('sys_choice');
			choice2.initialize();
			choice2.name = 'sys_user';
			choice2.element = 'preferred_language';
			choice2.language = 'en';
			choice2.value = value;
			choice2.inactive = false;
			choice2.label = label;
			choice2.insert();
		}
	}
	
})(current, previous);
