var AutoResolutionMLFactory = Class.create();

AutoResolutionMLFactory.createMLHelper = function(arConfigId, contextId, shouldCheckActive) {
	var activeQuery = '';
	if (!gs.nil(shouldCheckActive) && shouldCheckActive)
		activeQuery = '^active=true';

	contextId = contextId || '';

	if (AutoResolutionUtil.checkSolutionWithCapabilityExists(arConfigId, AutoResolutionConstants.AZ_ENCODED_QUERY + activeQuery)
		|| !AutoResolutionLanguageHelper.isLanguageConfigRecordPresent(arConfigId))
		return new global.AutoResolutionMLHelper(arConfigId);
	else if (AutoResolutionUtil.checkSolutionWithCapabilityExists(arConfigId, AutoResolutionConstants.LX_ENCODED_QUERY + activeQuery))
		return new global.AutoResolutionLanguageX(arConfigId, contextId);
	else if (AutoResolutionUtil.checkSolutionWithCapabilityExists(arConfigId, AutoResolutionConstants.COMPOSITE_ENCODED_QUERY + activeQuery))
		return new global.AutoResolutionComposite(arConfigId, contextId);
	else
		throw "Solution capability is not supported by Issue Auto-resolution";
};

AutoResolutionMLFactory.createMLHelperForCapability = function(capability, arConfigId) {
	if (capability === AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO || 
		capability === AutoResolutionConstants.ML_CAPBILITIES.AGENT_ZERO_WORKFLOW)
		return new global.AutoResolutionMLHelper(arConfigId);
	else if (capability === AutoResolutionConstants.ML_CAPBILITIES.LANGUAGEX)
		return new global.AutoResolutionLanguageX(arConfigId);
	else if (capability === AutoResolutionConstants.ML_CAPBILITIES.COMPOSITE)
		return new global.AutoResolutionComposite(arConfigId);
	else
		throw "Solution capability is not supported by Issue Auto-Resolution";
};
