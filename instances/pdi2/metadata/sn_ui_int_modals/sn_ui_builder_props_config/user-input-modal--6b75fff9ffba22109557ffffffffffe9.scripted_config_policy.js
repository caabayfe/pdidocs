function resizablePolicy({
	api,
	properties
}) {
	api.updateVisibility('fieldDefinitions', properties.dataSource === 'manual');
	api.updateVisibility('tableName', properties.dataSource === 'table');
	api.updateVisibility('columnNames', properties.dataSource === 'table');

	const getButtonPropsByType = (type) => [
		`${type}ButtonLabel`,
		`${type}ButtonSize`,
		`${type}ButtonIcon`,
		`${type}ButtonVariant`,
		`${type}ButtonTooltip`
	];

	getButtonPropsByType('primary').forEach((prop) => {
		api.updateVisibility(prop, properties['showPrimaryButton'] !== false);
	});

	getButtonPropsByType('secondary').forEach((prop) => {
		api.updateVisibility(prop, properties['showSecondaryButton'] !== false);
	});
}
