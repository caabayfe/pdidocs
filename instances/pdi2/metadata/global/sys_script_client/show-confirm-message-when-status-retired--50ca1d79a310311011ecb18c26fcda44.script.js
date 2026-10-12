function onSubmit() {

    if(g_scratchpad.userConfirmedForRetiredStatus){
		return true;
	}

	if(!g_scratchpad.isProjectRetired && g_form.modified && g_form.getValue("status") == "RETIRED") {

			var userConfirmationForRetiredStatus = function() {
				g_scratchpad.userConfirmedForRetiredStatus = true;
				g_form.submit();
			};
			
			var msgContent = new GwtMessage().getMessage("Setting the project's status to 'Retired' will eventually clean the generated results in {0} days. Do you still want to proceed with this operation?", g_scratchpad.autoCleanDays);
			var glideDialogClass = typeof GlideModal != 'undefined' ? GlideModal : GlideDialogWindow;
			var glideDialog = new glideDialogClass('glide_confirm_standard');
			glideDialog.setTitle(getMessage("Are you sure?"));
			glideDialog.setPreference('warning', true);
			glideDialog.setPreference('title', msgContent);
			glideDialog.setPreference('onPromptComplete', userConfirmationForRetiredStatus);
			glideDialog.render();

			return false;
	}
}
