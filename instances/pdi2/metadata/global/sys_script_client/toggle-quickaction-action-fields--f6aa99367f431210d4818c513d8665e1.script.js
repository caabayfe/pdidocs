function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }
   var serverMode = newValue == 'server';
   g_form.setMandatory('script', serverMode);
   g_form.setDisplay('script', serverMode);
   
}
