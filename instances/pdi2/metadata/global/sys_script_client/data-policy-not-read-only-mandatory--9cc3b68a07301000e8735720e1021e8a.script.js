function onSubmit() {
   if (g_form.getValue("disabled") == "true" && g_form.getValue("mandatory") == "true") {
      var msg = getMessage("Should not be both read only and mandatory");
      g_form.showFieldMsg("mandatory", msg, "error");
      return false;
   }
}
