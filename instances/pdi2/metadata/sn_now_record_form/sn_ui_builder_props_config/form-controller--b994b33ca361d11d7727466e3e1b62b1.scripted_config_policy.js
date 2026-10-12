// This script sets logical behavior for the Form controller config modal in UIB
function formControllerPolicy(args) {
	// args.trigger is null on first load of the config
	// every check should run on first load so that all the expected values are set based on previous config
	var isBootstrap = args.trigger === null;

    const overrideProps = [
			'actionConfigId',
			'headerConfigId',
            'highlightedValueConfigId',
			'ribbonConfigId',
            'viewRuleConfigId'
		];
	// set override section visibility based on if they checked override property
	if (args.trigger === 'overrideAppContextConfigIds' || isBootstrap) {
		const currentOverride = args.properties.overrideAppContextConfigIds;
        args.api.updateSectionVisibility('overrideConfigurationIds', currentOverride === true);
    }
}
