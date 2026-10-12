function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
	if (newValue.indexOf(">") > -1 || newValue.indexOf("<") > -1) {
		var msg = getMessage("Characters < and > are not allowed");
		g_form.showFieldMsg(control, msg, "error");
	} else {
		g_form.hideFieldMsg(control);
	}
}
