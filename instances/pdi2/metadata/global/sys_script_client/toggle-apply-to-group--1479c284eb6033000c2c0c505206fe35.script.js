function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   g_form.setMandatory('apply_to_groups', newValue != 'true');
   g_form.setDisplay('apply_to_groups', newValue != 'true');
}
