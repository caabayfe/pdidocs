function onChange(control, oldValue, newValue, isLoading) {
   if (!isLoading) {
      if (newValue.indexOf("update_synch") > -1 && oldValue.indexOf("update_synch") == -1) {
         g_form.showErrorBox("attributes","For more information, visit http://docs.servicenow.com/?context=Update_Synch");
         g_form.showErrorBox("attributes","The attribute update_synch should never be added to high traffic tables");
      }
   }
}
