function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   var type = g_form.getValue('type');
   if (type != "regex_replacement") {
	return;
   }

   //Type appropriate comment here, and begin script below
   g_form.showFieldMsg('type', "Caution: Applying Regex Replacement can easily produce malformed queries because it allows you to substitute the tokens any number of times in any order.")
}
