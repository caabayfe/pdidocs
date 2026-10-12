(function process( /*ResolverEnvironment*/ env) {
	if (GlidePluginManager.isUpgradeSystemBusy()) {
		return PADConstants.UpgradeError;
	}

    var gr = new GlideRecord(PADConstants.TABLES.PD_PROCESS_DEFINITION);
    if (!gr.canCreate()) {
        return PADConstants.UnauthorizedError;
    }

    var isNowAssistForPlaybookPluginActive = global.PDUtils.isNowAssistForPlaybookPluginActive();
    if (!isNowAssistForPlaybookPluginActive) {
        return {
            errorType: 'FEATURE_INACTIVE',
            message: gs.getMessage('The Playbook Generation skill is not active. Contact your playbook administrator to turn on this skill.')
        };
    }

    var args = env.getArguments();

    if (!!args.attachmentId) {
        var doesUserHaveImgToPlaybookAccess = global.PDUtils.isPlaybookGenerationWithImageEnabledForUser();
        if (!doesUserHaveImgToPlaybookAccess) {
            return PADConstants.UnauthorizedError;
        }
    } else {
        var doesUserHaveAccess = global.PDUtils.isPlaybookGenerationEnabledForUser();
        if (!doesUserHaveAccess) {
            return PADConstants.UnauthorizedError;
        }
    }

    try {
        var pdNowAssistUtils = new PDNowAssistUtils();
        var processResult = pdNowAssistUtils.generateProcess(args.prompt, args.process, args.attachmentId, args.kbId, args.additionalContextInfo);
        return processResult;
    } catch (err) {
        return {
            errorType: 'MUTATION_FAILED',
            message: err.message,
            header: err.header || ''
        };
    }
})(env);
