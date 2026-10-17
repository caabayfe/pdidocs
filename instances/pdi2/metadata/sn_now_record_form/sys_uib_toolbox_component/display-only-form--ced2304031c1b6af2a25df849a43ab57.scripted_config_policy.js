// eslint-disable-next-line no-unused-vars
function columnLayoutPolicy(args) {
	const { api, properties } = args;
	const { displayMode } = properties;

	const isDisplayLabelValue = displayMode === 'label-value';

	api.updateVisibility('labelValueLayout', isDisplayLabelValue);
	api.updateVisibility('labelValueLayoutSize', isDisplayLabelValue);
}
