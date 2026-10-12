// eslint-disable-next-line no-unused-vars
function colorSelectorPolicy({trigger, api, properties}) {
	if (trigger === 'showAccessibleColorSelector' || trigger === null) {
		api.updateVisibility(
			'contrastCheckType',
			properties.showAccessibleColorSelector,
		);
		api.updateVisibility(
			'comparisonColor',
			properties.showAccessibleColorSelector,
		);
	}
}
