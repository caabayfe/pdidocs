// eslint-disable-next-line no-unused-vars
function pillPolicy({trigger, api, properties}) {
	// Default state
	if (trigger === null) {
		api.updateVisibility('disabled', properties.interaction === 'select');
	}

	if (trigger === 'icon') {
		api.updateEnabled('avatarProps', !properties.icon);
		if (properties.icon !== 'No icon') {
			api.updateValue('avatarProps', undefined);
		}
	}

	if (trigger === 'avatarProps') {
		api.updateEnabled('icon', !properties.avatarProps);
		if (
			properties.avatarProps &&
			Object.keys(properties.avatarProps).length > 0
		) {
			api.updateValue('icon', '');
		}
	}

	if (trigger === 'interaction') {
		api.updateVisibility('disabled', properties.interaction === 'select');
	}
}
