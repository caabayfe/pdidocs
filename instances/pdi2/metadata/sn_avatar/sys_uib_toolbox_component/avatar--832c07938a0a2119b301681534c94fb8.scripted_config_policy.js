// eslint-disable-next-line no-unused-vars
function avatarPolicy({trigger, api, properties}) {
	if (trigger === null) {
		api.updateVisibility('href', properties.interaction === 'link');
		api.updateVisibility('opensWindow', properties.interaction === 'link');
	}
	if (trigger === 'interaction') {
		api.updateVisibility('href', properties.interaction === 'link');
		api.updateVisibility('opensWindow', properties.interaction === 'link');
	}
}
