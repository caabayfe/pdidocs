/**
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * This will hide/show properties for the new Tab set experience in Tokyo
 *
 * @param api - Contains the methods to controls the state of the properties
 */

// eslint-disable-next-line no-unused-vars
function policy(args) {
	const { api, properties, trigger } = args;
	const { position, selectedTabIndex } = properties;

	api.updateVisibility('dynamicTabData', false);
	api.updateVisibility('defaultRoute', false);
	api.updateVisibility('items', false);

	// If selectedTabIndex was never used, hide this field.
	// This is deprecated by 'selectedTab'.
	if (selectedTabIndex === null && !api.isDynamic('selectedTabIndex')) {
		api.updateVisibility('selectedTabIndex', false);
	}

	if (trigger === 'position' || !trigger) {
		if (position === 'top') {
			api.updateVisibility('maxWidth', true);
			api.updateVisibility('fixedWidth', true);
			api.updateVisibility('hidePadding', true);
			api.updateVisibility('spaceBetweenItems', false);
			api.updateVisibility('enableCollapsing', false);
			api.updateVisibility('initiallyCollapsed', false);
			api.updateVisibility('showInlinePadding', false);
		} else {
			api.updateVisibility('spaceBetweenItems', true);
			api.updateVisibility('enableCollapsing', true);
			api.updateVisibility('initiallyCollapsed', true);
			api.updateVisibility('showInlinePadding', true);
			api.updateVisibility('maxWidth', false);
			api.updateVisibility('fixedWidth', false);
			api.updateVisibility('hidePadding', false);
		}
	}
}
