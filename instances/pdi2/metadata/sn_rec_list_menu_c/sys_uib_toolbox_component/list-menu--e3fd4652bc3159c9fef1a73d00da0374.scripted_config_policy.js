import isEmpty from 'lodash/isEmpty';

// This file sets logical behavior for the NRLMC config panel in UIB
// e.g. disabling properties that depending on other props, etc

// eslint-disable-next-line no-unused-vars
function recordListMenuConnectedPolicy({api, trigger, properties}) {
	if (trigger === 'hideTabs') {
		api.updateEnabled('hideListCreation', !properties.hideTabs);
	}

	if (trigger === 'listId') {
		api.updateEnabled('tiny', !isEmpty(properties.listId));
	}

	if (trigger === 'tiny') {
		api.updateEnabled('selectedListId', !isEmpty(properties.tiny));
	}
}
