// System Defaults changes.  Flush sys_user cache to reflect NULL_OVERRIDE choice
setSessionParticulars();

function setSessionParticulars() {
	gs.getSession().setLanguage(current.value);
	gs.getSession().loadUserByID(gs.getUser().getID());
	
	// Flush sys_user choice cache so System Overrides are updated
	GlideCacheManager.prefixFlush("sys_choice_compiled", "sys_user");
    
    var msgArray = new Array();
    msgArray.push(current.name);
    msgArray.push(current.value);
    gs.addInfoMessage(gs.getMessage("Current user session updated with the following property:  {0} = {1}", msgArray));
    gs.addInfoMessage(gs.getMessage("The property is set in a user session; therefore, all (other) logged in users need to logout and then log back in to utilize the updated property."));
	if (current.name == 'glide.sys.language')
		gs.addInfoMessage(gs.getMessage("Reload your browser page to display System Language changes."));
}
