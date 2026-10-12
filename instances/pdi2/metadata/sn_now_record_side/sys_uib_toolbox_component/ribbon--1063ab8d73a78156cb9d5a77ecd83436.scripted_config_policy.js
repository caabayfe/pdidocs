// eslint-disable-next-line no-unused-vars
function ribbonPolicy(args) {
	const { api, properties, trigger } = args;
	if (trigger === 'isVisible')
		api.updateVisibility('collapsed', properties.isVisible);
}
