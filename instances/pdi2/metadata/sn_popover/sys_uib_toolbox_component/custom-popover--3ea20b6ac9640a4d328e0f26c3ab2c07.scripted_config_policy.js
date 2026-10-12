/**
 * Hereinafter the configuration for the UIB side panel properties
 * This function is being called by the now-ui json[scriptedConfigPolicy]
 * @param api - Contains the methods to controls the state of the properties
 * @param trigger - The current property changed action
 * @param properties - The properties and their values
 */
// eslint-disable-next-line no-unused-vars
function popoverPolicy(args) {
	var trigger = args.trigger;
	var api = args.api;
	var properties = args.properties;
	api.updateVisibility('positions', false);

	if (!trigger || trigger === 'positioningToTrigger') {
		var positionsArray = undefined;
		if (properties.positioningToTrigger === 'top') {
			positionsArray = properties.hideTail
				? [
						{target: 'top-start', content: 'bottom-start'},
						{target: 'top-end', content: 'bottom-end'},
					]
				: [{target: 'top-center', content: 'bottom-center'}];
		} else if (properties.positioningToTrigger === 'bottom') {
			positionsArray = properties.hideTail
				? [
						{target: 'bottom-start', content: 'top-start'},
						{target: 'bottom-end', content: 'top-end'},
					]
				: [{target: 'bottom-center', content: 'top-center'}];
		} else if (properties.positioningToTrigger === 'start') {
			positionsArray = properties.hideTail
				? [
						{target: 'top-start', content: 'top-end'},
						{target: 'bottom-start', content: 'bottom-end'},
					]
				: [{target: 'center-start', content: 'center-end'}];
		} else if (properties.positioningToTrigger === 'end') {
			positionsArray = properties.hideTail
				? [
						{target: 'top-end', content: 'top-start'},
						{target: 'bottom-end', content: 'bottom-start'},
					]
				: [{target: 'center-end', content: 'center-start'}];
		}
		api.updateValue('positions', positionsArray);
		// TODO: need to remove once DEF0371109 is fixed.
		args.properties.positions = positionsArray;
	}
}
