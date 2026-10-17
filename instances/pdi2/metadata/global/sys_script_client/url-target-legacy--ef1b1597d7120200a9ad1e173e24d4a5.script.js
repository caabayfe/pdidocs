function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (newValue == '')
      return;

   g_form.showFieldMsg("url_target", getMessage("URL target is no longer used starting with UI 15"));

}
