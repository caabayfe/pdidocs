function onLoad() {
   var currentUser = g_user.userID;
    
    // Set the value of the field to the current user's sys_id (or name, depending on the field type)
    g_form.setValue('user', currentUser);
    
    // Make the field read-only
    g_form.setReadOnly('user', true);
   
}
