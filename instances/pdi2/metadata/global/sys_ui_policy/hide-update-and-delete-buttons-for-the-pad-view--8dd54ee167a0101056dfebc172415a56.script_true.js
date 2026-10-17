function onCondition() {
	// The PAD View is used by the modal in the new playbook experience by process designer. We want to hide the update and delete buttons for it.
	if (g_form.getViewName() !== 'pad_view')
		return; 
	
   document.querySelectorAll('[data-action-name=sysverb_update]').forEach(function(button) {button.hide();});
	document.querySelectorAll('[data-action-name=sysverb_delete]').forEach(function(button) {button.hide();});

}
