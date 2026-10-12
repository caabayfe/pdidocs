// eslint-disable-next-line no-unused-vars
function buttonStatefulPolicy({trigger, api, properties}) {
	if (trigger === 'disabled' || trigger === null) {
		api.updateVisibility('tooltipContent', !properties.disabled);
	}
}
