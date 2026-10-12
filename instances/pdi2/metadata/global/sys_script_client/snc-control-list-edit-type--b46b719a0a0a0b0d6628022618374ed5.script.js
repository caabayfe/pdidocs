function onChange(control, oldValue, newValue, isLoading) {
   if (newValue == '') {
      g_form.removeOption("list_edit_type", "save_with_form");
   }
}
