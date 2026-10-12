function onLoad() {
   if (g_form.getValue("internal_type") != "" || g_form.isNewRecord())
      g_form.removeOption("internal_type", "");
}
