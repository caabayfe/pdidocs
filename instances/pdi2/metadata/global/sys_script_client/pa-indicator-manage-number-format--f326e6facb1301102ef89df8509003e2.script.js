function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if (newValue.length != 6 || newValue.match('^[a-zA-Z]{6}$') == null) {
      g_form.showFieldMsg('scores_format','Invalid number format. It must be 6 characters representing the International System of Units (ex:kMGTPE)','error')
   }
   
}
