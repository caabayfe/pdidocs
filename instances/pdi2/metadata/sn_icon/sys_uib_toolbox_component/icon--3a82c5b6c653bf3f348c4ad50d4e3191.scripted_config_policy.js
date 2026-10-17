// eslint-disable-next-line no-unused-vars
function iconPolicy({trigger, api, properties}) {
	if (trigger === 'icon' || trigger === null) {
		api.updateVisibility(
			'supportRtl',
			properties.icon.includes('right') || properties.icon.includes('left'),
		);
	}
}
