function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue === '') {
      return;
   }

   //set the name of the analytics source as <fact_table name>_dataset
   g_form.setValue("name", newValue + "_dataset");
}
