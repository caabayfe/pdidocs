function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if (g_scratchpad.nameLastModifiedBy == 'script') {
		g_scratchpad.nameLastModifiedBy = '';
	} else {
		g_scratchpad.nameLastModifiedBy = 'user';
	}

   var alphanumericRegex = /^[a-zA-Z0-9_]+$/;
    if (!alphanumericRegex.test(newValue)) {
       g_form.showFieldMsg("name", getMessage("Security Attribute name can only have alphanumeric characters and underscores (_)"), "error");
    }
   
}
