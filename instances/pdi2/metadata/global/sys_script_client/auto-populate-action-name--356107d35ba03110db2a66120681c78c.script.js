function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '' || !g_form.isNewRecord()) {
      return;
   }

   // Update the action_name with a parsed version of the action_label's new value.
   g_form.setValue('action_name', newValue.toLowerCase().replaceAll(' ', '_'));
}
