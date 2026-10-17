function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue == '') {
      return;
   }

   //auto-fill the title value to the mobile tile value
	var title = gel('sys_app_module.title');
	var mobileTitle = gel('sys_app_module.mobile_title');
	
	// if either title or mobile tile not available, then we are done
	if(title == null || mobileTitle == null)
		return;
	
	// if mobile title already has a value, then we are done
	if(mobileTitle.value.length > 0)
		return;
	
	// set the mobile title value with the value of the title
	g_form.setValue('mobile_title', title.value);
}
