// eslint-disable-next-line no-unused-vars
function inputPolicy({trigger, api, properties}) {
	// Default state
	if (trigger === null) {
		api.updateVisibility('offset', properties.position !== 'unset');
	}

	if (trigger === 'position') {
		api.updateVisibility('offset', properties.position !== 'unset');
	}
}
