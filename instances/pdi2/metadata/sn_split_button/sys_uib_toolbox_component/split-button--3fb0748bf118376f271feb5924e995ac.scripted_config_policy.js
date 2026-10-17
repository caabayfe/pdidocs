// eslint-disable-next-line no-unused-vars
function splitButtonPolicy({trigger, api, properties}) {
	// Inter-related properties
	if (trigger === 'disabled') {
		api.updateEnabled('opened', !properties.disabled);
	}
	if (trigger === 'opened') {
		api.updateEnabled('disabled', !properties.opened);
	}
	if (trigger === 'disabled' || trigger === null) {
		api.updateVisibility('tooltipContent', !properties.disabled);
	}
}
