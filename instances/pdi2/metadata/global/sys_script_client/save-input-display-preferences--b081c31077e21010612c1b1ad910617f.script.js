function onSubmit() {
	var inputDisplayPrefs = g_form.getValue('input_display_preferences');
	var displayPrefs = inputDisplayPrefs.split(';') || [];
	var displayPrefsObject = {};
	displayPrefs.forEach(function(pref) {
		var prefKeyValue = pref.split('=');
		if(pref) displayPrefsObject[prefKeyValue[0]] = prefKeyValue[1];
	});
	
    g_form.elements
        .filter(function getInputVarFields(element) {
            return element.tableName.startsWith('sys_pd_activity_definition.inputs.') && !element.fieldName.startsWith('inputs.');
        })
        .forEach(function saveDisplayPreferences(element) {
			var inputViewSelect = document.querySelector('select[name="display-preference-'+ element.fieldName+'"]');

			if (inputViewSelect && inputViewSelect.value && inputViewSelect.value !== 'empty')
				displayPrefsObject[element.fieldName] = inputViewSelect.value;
        });
	inputDisplayPrefs = '';
	for(key in displayPrefsObject){
		inputDisplayPrefs += key + '=' + displayPrefsObject[key] +';';
	}
	
	g_form.setValue('input_display_preferences', inputDisplayPrefs);
}
