// eslint-disable-next-line no-unused-vars
function radioButtonsPolicy({trigger, api, properties}) {
	// Default state
	if (trigger === null) {
		api.updateEnabled('hideRequiredIndicator', false);
	}

	// Inter-related properties
	if (trigger === 'disabled') {
		api.updateEnabled('readonly', !properties.disabled);
	}
	if (trigger === 'readonly') {
		api.updateEnabled('disabled', !properties.readonly);
	}
	if (trigger === 'required') {
		api.updateEnabled('hideRequiredIndicator', properties.required);
		api.updateEnabled('optional', !properties.required);
		if (!properties.required) {
			api.updateValue('hideRequiredIndicator', false);
		}
	}
	if (trigger === 'optional') {
		api.updateEnabled('required', !properties.optional);
	}
}
