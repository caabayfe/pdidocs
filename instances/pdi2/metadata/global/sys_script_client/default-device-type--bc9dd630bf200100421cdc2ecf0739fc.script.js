function onLoad() {
   if(g_form.isNewRecord())
	   return;
	
	var deviceType = gel('sys_app_application.device_type');
	if(!deviceType)
		return;
	
	// get the device type value from the scratch pad
	if(!g_scratchpad.device_type)
		deviceType.selectedIndex = 1; // set to browser if nil device type value
   
}
