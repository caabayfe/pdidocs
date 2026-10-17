function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '')
      return;

   //Set the Applies To to what the source is selected
   g_form.setValue('applies_to', newValue);
}
