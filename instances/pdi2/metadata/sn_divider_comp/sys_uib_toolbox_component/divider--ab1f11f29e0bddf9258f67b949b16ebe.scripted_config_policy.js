/* eslint-disable no-unused-vars */
function policy({properties, api}) {
	const DIVIDER_DEFAULT_COLOR = {
		value: '#CFD5D7',
		themeVariable: '--now-color_border--tertiary',
	};
	const handleDividerColorSelector = () => {
		api.updateInterfaceMetadata(
			'divider-color-picker',
			'propId',
			'color'
		);
		api.updateInterfaceMetadata(
			'divider-color-picker',
			'displayColor',
			properties.color
		);
		api.updateInterfaceMetadata(
			'divider-color-picker',
			'dividerdefaultBackgroundColor'
		);
		api.updateInterfaceMetadata(
			'divider-color-picker',
			'colorCategories',
			['dividerdefaultBackgroundColor', 'dividerRecommendedBrandColors']
		);

		api.updateInterfaceMetadata(
			'divider-color-picker',
			'defaultColor',
			DIVIDER_DEFAULT_COLOR
		);

		api.updateInterfaceMetadata(
			'divider-color-picker',
			'label',
			'Divider Color'
		);
		api.updateInterfaceMetadata(
			'divider-color-picker',

			'tooltipContent',

			'Select the color of the line to match your dashboard style.'
		);

		api.updateVisibility(
			'divider-color-picker',
			properties.color
		);
		api.updateVisibility('length', properties.layout === 'fixedlength');
	};

	handleDividerColorSelector();
}
