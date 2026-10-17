// eslint-disable-next-line no-unused-vars
function snLegacyWidgetPolicy({trigger, api, properties}) {
	if (trigger === 'showHeader' || trigger === null) {
		const showingHeader = properties.showHeader;
		api.updateVisibility('showTitle', showingHeader); //we show the title toggle when the header is visible
	}
}
