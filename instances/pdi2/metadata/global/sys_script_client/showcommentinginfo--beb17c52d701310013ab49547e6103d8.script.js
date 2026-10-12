function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading) {
		return;
	} else {
		if(oldValue == "false"){
			if (newValue == "true")
				g_form.showFieldMsg('disable_commenting',getMessage('Commenting will be disabled for all the articles in this Knowledge Base','info'));
			else
				g_form.hideFieldMsg('disable_commenting');
		}
		else{
			if (newValue == "false")
				g_form.showFieldMsg('disable_commenting',getMessage('Commenting will be enabled for all the articles in this Knowledge Base','info'));
			else
				g_form.hideFieldMsg('disable_commenting');
		}
	}      
}
