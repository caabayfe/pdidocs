function onChange(control, oldValue, newValue, isLoading, isTemplate) {
   if (isLoading || newValue === '') {
      return;
   }

   //HTTP Response Headers do not allow spaces in the name.
	var validName = RegExp(/^(([A-Za-z0-9]+-?)*[A-Za-z0-9]+)*$|^([A-Za-z0-9]+)$/g);
	
	if(!validName.test(newValue)) {
		var temp = newValue.trim();
		//Remove multiple hyphens and replace spaces/underscores with hyphen.
		var fixed = temp.replace(/(\s|_)/g,'-').replace(/-+/g,'-');
		g_form.showFieldMsg("header_name", getMessage("HTTP Headers only contain text and '-'. No spaces or _ are permitted.", "error"));
		
		if(fixed == newValue)
			return;
		
		g_form.setValue("header_name", fixed);
	}else {
		g_form.clearMessages();
	} 
}
