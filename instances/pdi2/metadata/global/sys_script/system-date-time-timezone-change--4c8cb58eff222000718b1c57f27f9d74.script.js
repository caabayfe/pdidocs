// we changed our own user record. Set out timezone, date, and time formats
setSessionParticulars();

function setSessionParticulars() {
    if (current.name.equals("glide.sys.date_format")) {
        gs.getSession().setDateFormat(current.value);
        gs.getUser().setDateFormat(current.value);
    }
    
    if (current.name.equals("glide.sys.time_format")) {
        gs.getSession().setTimeFormat(current.value);
        gs.getUser().setTimeFormat(current.value);
    }
    
    if (current.name.equals("glide.sys.default.tz"))
        gs.getSession().setTimeZoneName(current.value);
	
	// Flush sys_user choice cache so System Overrides are updated
	GlideCacheManager.prefixFlush("sys_choice_compiled", "sys_user");
	GlideCacheManager.prefixFlush("sys_choice_compiled", "contract_sla");
    
    var msgArray = new Array();
    msgArray.push(current.name);
    msgArray.push(current.value);
    gs.addInfoMessage(gs.getMessage("Current user session updated with the following property:  {0} = {1}", msgArray));
    if (GlidePluginManager.isActive('com.glide.edgeencryption') && new sn_edge_encryption_ns.GlideEdgeEncryptionAttributes().isEdgeEncryptionUnlocked())
		gs.addInfoMessage(gs.getMessage("The property is set in a user session; therefore, all logged in users need to logout and then log back in to utilize the updated property."));
	else
		gs.addInfoMessage(gs.getMessage("The property is set in a user session; therefore, all (other) logged in users need to logout and then log back in to utilize the updated property."));

}
