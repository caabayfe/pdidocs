function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading)
      return;
   
   if (newValue != "true")
      return;

   // 'async' and 'async_always'
   if (g_form.getValue("when").indexOf('async') != 0)
      return;

   if (typeof g_form.asyncMsg != "undefined")
      return;  // Message has already been displayed

   g_form.asyncMsg = true;
   var msg = getMessage("Async delete rules will not have access to the 'current' object");
   g_form.showFieldMsg("script", msg, "info", true);
}
