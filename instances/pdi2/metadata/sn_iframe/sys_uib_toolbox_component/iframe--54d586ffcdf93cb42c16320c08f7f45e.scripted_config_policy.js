// eslint-disable-next-line no-unused-vars
function iframePolicy({trigger, api, properties}) {
	// Default state
	if (trigger === null) {
		api.updateEnabled('allowTopNavigation', properties.disableSandbox);
		api.updateVisibility('allowTopNavigation', properties.disableSandbox);
	}
	if (trigger === 'disableSandbox') {
		api.updateEnabled('allowTopNavigation', properties.disableSandbox);
		api.updateVisibility('allowTopNavigation', properties.disableSandbox);
	}
}
