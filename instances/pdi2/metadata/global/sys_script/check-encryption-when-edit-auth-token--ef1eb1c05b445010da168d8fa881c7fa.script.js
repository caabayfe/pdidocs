(function executeRule(current, previous /*null when async*/) {
	if(gs.getProperty('glide.sg.device_encryption_enabled') == 'false') {
		gs.log('For security reason, mobile device encryption feature should be turned on if you want to set oauth token lifespan to longer than 100 days. Check sys_properties table and set glide.sg.device_encryption_enabled to true, and then proceed the action');
		gs.addErrorMessage(gs.getMessage("To increase the refresh token lifespan, you need to enable mobile device encryption first. You can do this in <a href = '/nav_to.do?uri=sys_properties.do?sys_id=7ba34f105b030010da168d8fa881c7e4' target='_blank'>System Properties</a> by setting glide.sg.device_encryption_enabled to true."));
		current.setAbortAction(true);
		return;
	}
})(current, previous);
