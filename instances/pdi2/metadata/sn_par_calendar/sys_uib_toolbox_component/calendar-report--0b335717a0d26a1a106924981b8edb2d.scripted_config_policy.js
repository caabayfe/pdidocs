// eslint-disable-next-line no-unused-vars
function policy(args) {
	var api = args.api;
	var properties = args.properties;

	const { hideDevSettings, hideEndDate } = properties;

	api.updateVisibility('headingLevel', !hideDevSettings);

	if (hideEndDate) {
		api.updateVisibility('endDateField', false);
		api.updateValue('endDateField', '');
	} else {
		api.updateVisibility('endDateField', true);
	}
}
