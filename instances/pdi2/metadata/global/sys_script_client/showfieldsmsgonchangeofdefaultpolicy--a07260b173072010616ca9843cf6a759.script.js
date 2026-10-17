function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   g_form.showFieldMsg("default_policy", getMessage("Please save the form to reflect the selected Policy related Input(s) and Condition(s) below."));
   
}
