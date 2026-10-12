(function executeRule(current, previous   /*null when async*/ ) {
    if (current.process_type != previous.process_type) {
		var pdProcessService = new PDProcessService();

		var unsupportedFeaturesForType = pdProcessService.getUnsupportedFeatures({
			processDefinitionId: current.sys_id,
			targetProcessTypeId: current.process_type
		});

		var unsupportedFeatures = unsupportedFeaturesForType.unsupportedFeatures;

		if (unsupportedFeatures.length === 0)
			return;
			
		var featuresForMessage = '';

		for (var i = 0; i < unsupportedFeatures.length; i++) {
			var feature = unsupportedFeatures[i].toUpperCase();
			var featureDisplayName = PDConstants.FEATURES.DISPLAY_NAMES[feature] || unsupportedFeatures[i];

			if (i === 0) 
				featuresForMessage = featureDisplayName;
			if (i !== 0 && i !== unsupportedFeatures.length - 1)
				featuresForMessage = featuresForMessage + ", " + featureDisplayName;
			if (i !== 0 && i === unsupportedFeatures.length - 1)
				featuresForMessage = featuresForMessage + " and " + featureDisplayName;
		}

		var processType = new GlideRecord(PDConstants.TABLES.PD_PROCESS_TYPE);
		processType.get(current.process_type);

		var processTypeName = processType.getValue(PDConstants.FIELDS.NAME);

        gs.addErrorMessage(
			gs.getMessage(
				"This process contains {0} which are not supported by the {1} process type.", 
				[featuresForMessage, processTypeName]
			)
		);
		
        current.setAbortAction(true);
    }

})(current, previous);
