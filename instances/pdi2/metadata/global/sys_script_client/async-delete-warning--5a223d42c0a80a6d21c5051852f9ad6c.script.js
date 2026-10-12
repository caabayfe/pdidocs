function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   // 'async' and 'async_always'
   if (newValue.indexOf('async') != 0)
      return;

   if (g_form.getValue("action_delete") != "true")
      return;

   if (typeof g_form.asyncMsg != "undefined")
      return;  // Message already has been displayed

   g_form.asyncMsg = true;
   var msg = getMessage("Async delete rules will not have access to the 'current' object");
   g_form.showFieldMsg("script", msg, "info", true);
}
