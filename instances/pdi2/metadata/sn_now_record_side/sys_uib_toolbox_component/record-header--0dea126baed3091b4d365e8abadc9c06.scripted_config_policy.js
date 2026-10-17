/**
 * This function is being called by the now-ui json[scriptedConfigPolicy] for Record header
 *
 * @param api - Contains the methods to controls the state of the properties
 */

// eslint-disable-next-line no-unused-vars
function policy(args) {
	const { api, properties, trigger } = args;
	const { hideTagsValue } = properties;

	if (trigger === 'hideTagsValue') {
		if (hideTagsValue) {
			api.updateVisibility('recordTags', false);
		} else {
			api.updateVisibility('recordTags', true);
		}
	}
}
