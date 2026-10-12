// eslint-disable-next-line no-unused-vars
function cardPolicy({trigger, api, properties}) {
	// Default state
	if (trigger === null) {
		api.updateVisibility('selected', properties.interaction === 'select');
		api.updateVisibility('manageSelected', properties.interaction === 'select');
	}

	// Inter-realted properties
	if (trigger === 'interaction') {
		if (properties.interaction === 'select') {
			api.updateVisibility('selected', true);
			api.updateVisibility('manageSelected', true);
		}
		if (properties.interaction !== 'select') {
			api.updateValue('selected', false);
			api.updateVisibility('selected', false);
			api.updateVisibility('manageSelected', false);
		}
	}
}
