function footerButtonsPolicy({
	api,
	properties
}) {
	const getButtonPropsByType = (type) => [
		`${type}ButtonLabel`,
		`${type}ButtonSize`,
		`${type}ButtonIcon`,
		`${type}ButtonVariant`,
		`${type}ButtonTooltip`,
		`${type}ButtonSave`,
		`${type}ButtonClose`
	];

	getButtonPropsByType('primary').forEach((prop) => {
		api.updateVisibility(prop, properties['showPrimaryButton'] !== false);
	});

	getButtonPropsByType('secondary').forEach((prop) => {
		api.updateVisibility(prop, properties['showSecondaryButton'] !== false);
	});
}
