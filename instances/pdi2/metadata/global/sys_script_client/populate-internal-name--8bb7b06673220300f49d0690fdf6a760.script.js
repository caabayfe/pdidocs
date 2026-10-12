function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //Type appropriate comment here, and begin script below
   ScriptLoader.getScripts(['DBNameSanitizer.js'], function() {
		if (g_form.getValue('name') !== '')
			return;
		//Replace $ with _ and then remove all leading non alphabets
		var label = newValue.replace(/\$/g, '_').replace(/^[^a-zA-Z]+/, '');
		var sanitizer = new DBNameSanitizer();
		label = sanitizer.trimName(label);   
		sanitizer.setValueOnTargetElement('internal_name', label, 'Variable Set');

   });
}
