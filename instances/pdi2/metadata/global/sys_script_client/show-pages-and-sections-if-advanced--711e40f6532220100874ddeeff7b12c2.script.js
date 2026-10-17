function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue == 'true') {
      g_form.setSectionDisplay('sections', true);
      g_form.setSectionDisplay('pages', true);
   }
   else {
      g_form.setSectionDisplay('sections', false);
      g_form.setSectionDisplay('pages', false);
   }
}
