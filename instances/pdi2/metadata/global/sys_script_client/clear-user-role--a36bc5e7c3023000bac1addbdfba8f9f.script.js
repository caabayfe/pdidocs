function onSubmit() {
    // Clear out the user_role field if our Create Access Controls box is unchecked on submit.
    
    if (g_form.getValue('create_access_controls') == 'true') { 
		// We want to create ACLs, so don't mess with the user role. 
		return;
	}

	if (g_form.getValue('user_role') != '') {
		// Real value is set, so leave it alone.
		return;
	}
    
	// Since only the display value could be set here, be sure it is empty so we do not 
	// create a user role
    g_form.clearValue('user_role');
}
