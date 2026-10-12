function onChange(control, oldValue, newValue) {
   // if apps plugin installed, then do not need to process this client script as reference types can be changed
   if (g_scratchpad.appsPluginInstalled == true)
      return;
 

   g_form.hideFieldMsg("internal_type", true);
   if (oldValue != 'reference' && oldValue != 'glide_list' && oldValue != "document_id")
      return;

   // if it was once a reference it stays that way. 
   if (newValue == 'reference' || newValue == 'glide_list' || newValue == "document_id")
      return;

   g_form.setValue('internal_type', oldValue);
   g_form.showFieldMsg("internal_type", getMessage('Reference type fields cannot be changed to non reference types'), "error");
}
