// eslint-disable-next-line no-unused-vars
function buttonIconicPolicy({trigger, api, properties}) {
	if (trigger === 'bare' || trigger === null) {
		api.updateVisibility('hidePadding', properties.bare);
	}

	if (trigger === 'disabled' || trigger === null) {
		api.updateVisibility('tooltipContent', !properties.disabled);
	}
}
