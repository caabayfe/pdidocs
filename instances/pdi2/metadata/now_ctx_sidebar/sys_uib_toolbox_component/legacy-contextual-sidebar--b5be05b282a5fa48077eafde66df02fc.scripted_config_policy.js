// it's been used in now-ui.json
// eslint-disable-next-line no-unused-vars
function scriptedPolicy(args) {
	const { trigger } = args;
	const { properties } = args;
	const { api } = args;
	api.updateVisibility('defaultRoute', false);
	api.updateVisibility('viewportConfiguration', false);
	if (trigger === 'collapsable') {
		api.updateVisibility('defaultCollapsed', properties.collapsable);
	}
}
