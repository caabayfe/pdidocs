// This script sets logical behavior for the list menu config panel in UIB ONLY WHEN IT IS USED WITH THE LIST CONTROLLER PRESET
function listMenuPolicy(args) {
	// args.trigger is null on first load of the config
	// every check should run on first load so that all the expected values are set based on previous config
	var isBootstrap = args.trigger === null;

	// external props from the controller are objects, not strings the way component props are.
	// shape: { type: 'externalProp', name: 'propName'}
	// setting this as a var and checking it prevents js object value semantics issues and shortens if statements
	var isExternalTrigger = typeof args.trigger === "object";

	if (args.trigger === "showTabs" || isBootstrap) {
		args.api.updateProperty(
			'tabItems',
			{
				enabled: !args.properties.showTabs
			}
		);
	}

	if (args.trigger === "tabItems" || isBootstrap) {
		args.api.updateProperty(
			'selectedTabId',
			{
				enabled: args.properties.tabItems != []
			}
		);
	}

	if (args.trigger === "menuItems" || isBootstrap) {
		var isMenuItemsNonEmpty = args.properties.menuItems != [];
		args.api.updateProperty(
			{
				type: 'externalProp',
				name: 'listId'
			},
			{
				enabled: isMenuItemsNonEmpty
			}
		);
		args.api.updateProperty(
			'expandedItems',
			{
				enabled: isMenuItemsNonEmpty
			}
		);
	}
}
