function onLoad() {
   if (g_user.hasRole('service_mapping_admin') && !g_user.hasRole('evt_mgmt_admin') ){
	   if (g_form.isNewRecord()){ //if the record is new - set 'Target' to 'Service mapping'
		   g_form.setValue('target', 'mapping');
	   }
	   g_form.setReadOnly('target',true);
   } else if (g_user.hasRole('evt_mgmt_admin') && !g_user.hasRole('service_mapping_admin')){
	   if (g_form.isNewRecord()){ //if the record is new - set 'Target' to 'Event managment'
		   g_form.setValue('target', 'snac');
	   }
	   g_form.setReadOnly('target',true);
   }
}
