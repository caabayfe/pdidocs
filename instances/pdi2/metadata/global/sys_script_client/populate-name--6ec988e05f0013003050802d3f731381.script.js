function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   //Type appropriate comment here, and begin script below
	ScriptLoader.getScripts(['DBNameSanitizer.js'], function() {
		if (g_form.getValue('name') !== '')
			return;
		//Replace $ with _ and then remove all leading non alphabets
		var question = newValue.replace(/\$/g, '_').replace(/^[^a-zA-Z]+/, '');
		var sanitizer = new DBNameSanitizer();
		question = sanitizer.trimName(question);
		sanitizer.setValueOnTargetElement('name', question, 'Variable');
   });
}
