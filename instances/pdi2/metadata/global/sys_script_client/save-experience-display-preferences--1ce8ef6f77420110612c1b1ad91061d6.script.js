function onSubmit() {
	var experienceDisplayPrefs = g_form.getValue('experience_display_preferences');
	var displayPrefs = experienceDisplayPrefs.split(';') || [];
	var displayPrefsObject = {};
	displayPrefs.forEach(function(pref) {
		var prefKeyValue = pref.split('=');
		if(pref) displayPrefsObject[prefKeyValue[0]] = prefKeyValue[1];
	});
	
    g_form.elements
        .filter(function getExperienceVarFields(element) {
            return element.tableName.startsWith('sys_pd_activity_definition.type_vals.') && !element.fieldName.startsWith('type_vals.');
        })
        .forEach(function saveDisplayPreferences(element) {
			var inputViewSelect = document.querySelector('select[name="experience-display-preference-'+ element.fieldName+'"]');

			if (inputViewSelect && inputViewSelect.value)
				displayPrefsObject[element.fieldName] = inputViewSelect.value;
        });
	
	experienceDisplayPrefs = '';
	for(key in displayPrefsObject){
		experienceDisplayPrefs += key + '=' + displayPrefsObject[key] +';';
	}

	g_form.setValue('experience_display_preferences', experienceDisplayPrefs);
}
