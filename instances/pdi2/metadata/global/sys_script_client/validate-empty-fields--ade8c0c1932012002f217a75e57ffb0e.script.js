function onSubmit() {

   if(g_form.getValue('asset_state') == '' && g_form.getValue('configuration_item_status') == ''){
	   g_form.addErrorMessage(getMessage("Please enter valid values for asset's state and configuration item status."));
	   return false;
   }
}
