(function process( /*ResolverEnvironment*/ env) {

    // implement data resolver here
    var workspaceId = env.getArguments().workspaceId;
    var isActive = env.getArguments().isSessionTabEnabled;
    var firstColorThreshold = env.getArguments().firstColorThreshold;
    var secondColorThreshold = env.getArguments().secondColorThreshold;
	var thresholdLevels = env.getArguments().thresholdLevels;

    var infoSessionGR = new GlideRecordSecure('information_session_tab_workspace_setting');

    infoSessionGR.addQuery('workspace', workspaceId);
    infoSessionGR.query();

    if (infoSessionGR.next()) {
		var existingThresholdLevels = infoSessionGR.getValue('u_threshold_levels');

		if(infoSessionGR.getValue('is_active')!==isActive || !existingThresholdLevels.equals(thresholdLevels)) {

			infoSessionGR.setValue('is_active', isActive);
			if(isActive){
			infoSessionGR.setValue('u_threshold_levels', thresholdLevels);
			}
			infoSessionGR.update();
			return "record updated";
		}
		return "record already updated";
    } else {
		infoSessionGR.workspace = workspaceId;
		infoSessionGR.is_active = isActive;
		if(isActive){
		infoSessionGR.u_threshold_levels = thresholdLevels;
		}
		infoSessionGR.insert();

		return "record created in table";
	}
})(env);
