function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   if(newValue < 0)
      g_form.showFieldMsg("max_form_fields_on_card", getMessage("Max form fields on card cannot have a negative value"), "error");
}
