// This script sets logical behavior for the header config panel in UIB ONLY WHEN USED WITH THE LIST CONTROLLER PRESET.
function recordListHeaderPolicy(args) {
	// args.trigger is null on first load of the config
	// every check should run on first load so that all the expected values are set based on previous config
	var isBootstrap = args.trigger === null;

	// external props from the controller are objects, not strings the way component props are.
	// shape: { type: 'externalProp', name: 'propName'}
	// setting this as a var and checking it prevents js object value semantics issues and shortens if statements
	var isExternalTrigger = (!isBootstrap && typeof args.trigger === 'object');


	if (args.trigger === 'showTitle' || isBootstrap) {
		args.api.updateProperty('title', { enabled: args.properties.showTitle !== false });
	}

	if (args.trigger === 'showSubtitle' || isBootstrap) {
		args.api.updateProperty('subtitle', { enabled: args.properties.showSubtitle !== false });
	}

	if (args.trigger === 'showCount' || isBootstrap) {
		args.api.updateProperty('count', { enabled: args.properties.showTitle !== false });
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'recordCountLimit'
			},
			{
				enabled: args.properties.showCount !== false
			}
		);
	}

	if (args.trigger === 'showEditColumnsButton' || isBootstrap) {
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'enableDotWalk'
			},
			{
				enabled: args.properties.showEditColumnsButton
			}
		);
	}

	if (args.trigger === 'showAiFilterAssist' || isBootstrap) {
		args.api.updateProperty('showAiFilterAssistVoiceMic', { 
			enabled: args.properties.showAiFilterAssist
		});
	}

	if ((isExternalTrigger && args.trigger.name === 'enableDeclarativeActions') || isBootstrap) {
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'actionConfigId'
			},
			{
				enabled: args.externalProperties.enableDeclarativeActions
			}
		);
	}
	// For list type withMenu: Hide declarative actions config as they are controlled from sys_ux_list table for featureFlag override.
	if (args.externalProperties.listType === 'withMenu') {
		args.api.updateProperty({ type: 'externalProp', name: 'enableDeclarativeActions' }, { isVisible: false });
	}
}
