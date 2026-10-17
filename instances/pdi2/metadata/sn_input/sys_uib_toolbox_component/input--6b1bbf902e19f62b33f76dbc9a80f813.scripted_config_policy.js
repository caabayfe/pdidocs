// eslint-disable-next-line no-unused-vars
function inputPolicy({trigger, api, properties}) {
	// Default state
	if (trigger === null) {
		api.updateEnabled('hideRequiredIndicator', false);
		api.updateSectionVisibility('number', false);
		api.updateVisibility('multiple', false);
	}

	// Inter-related properties
	if (trigger === 'disabled') {
		api.updateEnabled('readonly', !properties.disabled);
		api.updateEnabled('autofocus', !properties.disabled);
	}
	if (trigger === 'readonly') {
		api.updateEnabled('disabled', !properties.readonly);
		api.updateEnabled('autofocus', !properties.readonly);
	}
	if (trigger === 'autofocus') {
		api.updateEnabled('disabled', !properties.autofocus);
		api.updateEnabled('readonly', !properties.autofocus);
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
	if (trigger === 'type') {
		api.updateVisibility('multiple', properties.type === 'email');
		api.updateSectionVisibility('number', properties.type === 'number');
	}
}
