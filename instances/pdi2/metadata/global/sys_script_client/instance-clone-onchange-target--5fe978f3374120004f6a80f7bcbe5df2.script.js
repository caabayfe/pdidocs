function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }
   
   onTargetChanged();
    g_form.setValue('clone_frequency', '');
}
