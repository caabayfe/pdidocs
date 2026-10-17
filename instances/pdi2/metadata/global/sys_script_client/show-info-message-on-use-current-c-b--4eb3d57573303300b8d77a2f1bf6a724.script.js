function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

	if(g_form.getValue('type') == 'delete' && newValue == 'false')
		g_form.addInfoMessage(getMessage('Unchecking "Use current record as condition" checkbox can cause multiple record removing and is not recommended. Use at your own risk.'));
   //Type appropriate comment here, and begin script below
   
}
