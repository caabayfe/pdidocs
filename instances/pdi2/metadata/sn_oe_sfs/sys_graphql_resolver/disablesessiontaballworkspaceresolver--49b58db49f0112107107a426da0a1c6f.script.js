(function process(/*ResolverEnvironment*/ env) {

    var tableName = env.getArguments().tableName;
    var isSessionTabFeatureEnabled = env.getArguments().isSessionTabFeatureEnabled;

    var systemPropertiesGR = new GlideRecordSecure('sys_properties');
    systemPropertiesGR.addQuery('name', 'sn_oe_sfs.enable_information_session_tabs');
    systemPropertiesGR.query();
    if (systemPropertiesGR.next()) {
        systemPropertiesGR.setValue('value', isSessionTabFeatureEnabled);
        systemPropertiesGR.update();
    }

    if (!isSessionTabFeatureEnabled) {
        var infoSessionSettingGR = new GlideRecordSecure(tableName);
        infoSessionSettingGR.query();

	while(infoSessionSettingGR.next()) {
		if(infoSessionSettingGR.getValue('is_active')!=false) {
                infoSessionSettingGR.setValue('is_active', false);
                infoSessionSettingGR.update();
            }
        }

        return "session tabs disabled for all workspaces";
    }

    return "session tabs enabled for instance";
})(env);
