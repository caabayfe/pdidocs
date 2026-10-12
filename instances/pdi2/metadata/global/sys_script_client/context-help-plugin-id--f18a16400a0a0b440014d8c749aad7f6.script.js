function onChange(control, oldValue, newValue) {
   if (newValue == "true")
      g_form.setMandatory("plugin_id", true);
   else
      g_form.setMandatory("plugin_id", false);
}
