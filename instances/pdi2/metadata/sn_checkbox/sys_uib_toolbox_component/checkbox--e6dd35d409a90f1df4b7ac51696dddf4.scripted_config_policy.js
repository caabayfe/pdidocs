// eslint-disable-next-line no-unused-vars
function checkboxPolicy({trigger, api, properties}) {
	if (trigger === 'disabled') {
		api.updateEnabled('readonly', !properties.disabled);
	}
	if (trigger === 'readonly') {
		api.updateEnabled('disabled', !properties.readonly);
	}
}
