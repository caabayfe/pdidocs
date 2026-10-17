	var submitProfileForm = false;
	var showConfirmDialog = false;
	
	function onSubmit() {
		if(!submitProfileForm) {
			var isProfileMarkedDefault = g_form.getValue('default_profile');
			if(isProfileMarkedDefault == 'false' || !isProfileMarkedDefault) 
				return true;
			else {
				var ga = new GlideAjax("InstanceCloneManagerAjax");
				ga.addParam("sysparm_name", "isDefaultProfileAllowed");
				ga.addParam("sysparm_profile", g_form.getUniqueValue());
				ga.getXMLWait();
				
				if(ga.getAnswer() == 'false') {
					showConfirmDialog = true;
				}
			}
			
			if(showConfirmDialog) {
				showConfirmationDialog();
				return false;
			}
		} 
		
		return true;
	}
	
	function showConfirmationDialog() {
		var dialog = new GlideDialogWindow('glide_confirm_basic');
		dialog.setTitle(new GwtMessage().getMessage('Default Profile'));
		dialog.setPreference('warning', true);
		dialog.setPreference('title', "A default profile already exists. This action will update the current profile as a default profile.");
		dialog.setPreference('onPromptComplete',  confirm);
		dialog.setPreference('onPromptCancel', cancel);
		dialog.render(); 
	}
	
	function confirm() {
		submitProfileForm = true;
		g_form.submit();
	}
	
	function cancel() {
	}
