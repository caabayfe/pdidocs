function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
   if (newValue.split(" ").size() > 1){
	  g_form.showFieldMsg('keyword', getMessage('Keyword must be only one word with no spaces!'), 'error');
	  return;
   }
   g_form.hideFieldMsg('keyword');
}
