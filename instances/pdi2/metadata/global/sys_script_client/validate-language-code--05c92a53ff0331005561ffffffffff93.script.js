function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

	var str = g_form.getValue("notify_language.language_code");
	var patt = /[a-z][a-z]-[A-Z][A-Z]/;
	var res = patt.test(str);

	if(!res)
		g_form.showFieldMsg('notify_language.language_code', getMessage('Invalid language code. Code must be 2 lower case characters followed by a dash followed by 2 upper case characters e.g. en-US'),'error');
}
