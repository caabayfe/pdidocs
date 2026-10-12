(function executeRule(current, previous) {
	var arrayUtil = new ArrayUtil();
	var processor = new GlideRecord('sys_processor');
	processor.get(current.sys_processor);
	if (processor.type != "java")
		return;

    var profile_check = gs.getProperty('com.glide.httpauthprocessor.subclass.access_policy_check');
    if ( !profile_check ||  'true' === profile_check.toLowerCase() ){
		var authUtil = new sn_auth.ProcessorPolicyUtil();
		if ( !authUtil.isAuthProfileSupported(current.sys_processor) ){
			gs.addErrorMessage(gs.getMessage('Error: processor {0} is not supported for authentication profile.', processor.name));
			current.setAbortAction(true);
		}
    }
    else {
		// backward compatibility, check processors defined in allowed list only
		var property_value = gs.getProperty('com.glide.auth.profile.supported.processor.list');
		var supported_processors = property_value.split(',');
		if (!arrayUtil.contains(supported_processors, processor.name)) {
			gs.addErrorMessage(gs.getMessage('Error: processor {0} is not supported for authentication profile.', processor.name));
			current.setAbortAction(true);
		}
    }
})(current, previous);
