(function executeRule(current, previous /*null when async*/) {

	var mobileAppTypeOptions = {};
    var defaultType = null;
    var mobileAppGR = new GlideRecord('sys_sg_mobile_application');
	if(!mobileAppGR.isValid()){
		g_scratchpad.mobileAppTypeOptions = mobileAppTypeOptions;
		g_scratchpad.currentMobileAppType = current.getValue('client_type');
		return;
	}
	
	mobileAppGR.orderBy('name');	
    mobileAppGR.query();
    while (mobileAppGR.next()) {
        var label = mobileAppGR.getValue('name');
        var type = mobileAppGR.getValue('client_type_header');
        mobileAppTypeOptions[type] = label;
        if (defaultType == null)
            defaultType = type;
    }

    g_scratchpad.mobileAppTypeOptions = mobileAppTypeOptions;
    var selectedType = current.getValue('client_type');
    if (!selectedType)
        selectedType = defaultType;

    g_scratchpad.currentMobileAppType = selectedType;

})(current, previous);
