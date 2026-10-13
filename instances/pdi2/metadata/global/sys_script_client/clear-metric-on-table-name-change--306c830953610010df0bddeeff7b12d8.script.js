function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === ''|| oldValue === newValue) {
      return;
   }

   // Clear out Metric field because it is associated to the Table Name
   g_form.clearValue("metric");
}
