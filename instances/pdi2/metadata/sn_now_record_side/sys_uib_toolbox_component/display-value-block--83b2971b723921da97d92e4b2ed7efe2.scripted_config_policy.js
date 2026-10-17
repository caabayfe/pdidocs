/**
 * This function is being called by the now-ui json[scriptedConfigPolicy] for displayValueBlock
 *
 * @param api - Contains the methods to controls the state of the properties
 */

// eslint-disable-next-line no-unused-vars
function policy(args) {
	const { api, properties, trigger } = args;
	const { hideLabels } = properties;

	if (trigger === 'hideLabels') {
		if (hideLabels) {
			api.updateVisibility('displayInline', false);
		} else {
			api.updateVisibility('displayInline', true);
		}
	}
}
