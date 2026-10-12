/**
 * Extension of properties to include custom UIB interfaces used by headerColor and titleColor properties
 * @typedef {{['par-header-color-selector']: string, ['par-title-color-selector']: string}} InterfaceExtensions
 */

/**
 * This function is inlined by Tectonic to UIB metadata and is used by UIB
 * to perform custom layout tweaks of component config panel.
 * It is associated with target component in `now-ui.json -> <component> -> uiBuilder -> scriptedConfigPolicy`.
 *
 * This particular function is intended to be used by config panel of `sn-promin-process-map-connected` component.
 * @type {UIB.PolicyInvoker<SnProminProcessMapConnected.Props & InterfaceExtensions>}
 **/
// eslint-disable-next-line @typescript-eslint/no-unused-vars
function applyPolicies({ api, properties, trigger }) {
	const { projectId, starDiagramCenterNode, diagramType } = properties;

	// Set metadata for our custom UI Config panel component so it receives it as props
	// Component: sn-promin-uib-custom-value-selector
	api.updateInterfaceMetadata('starDiagramCenterNode', 'projectId', projectId);
	api.updateInterfaceMetadata('starDiagramCenterNode', 'propName', 'starDiagramCenterNode');
	api.updateInterfaceMetadata('starDiagramCenterNode', 'propValue', starDiagramCenterNode);

	const isProjectSelected = Boolean(projectId) || api.isDynamic('projectId');
	const isProcessGraph = isProjectSelected && (diagramType === 'process' || api.isDynamic('diagramType'));
	const isStarGraph = isProjectSelected && (diagramType === 'star' || api.isDynamic('diagramType'));

	// Set visibility for properties conditionally on project selection or diagram type
	api.updateVisibility('diagramType', isProjectSelected);
	api.updateVisibility('followFilters', isProjectSelected);
	api.updateVisibility('showNodeArcPopupActions', isProjectSelected);
	api.updateVisibility('enableCaseFollowSimulation', isProcessGraph);
	api.updateVisibility('edgePercentage', isProcessGraph);
	api.updateVisibility('nodePercentage', isProcessGraph);
	api.updateVisibility('starDiagramCenterNode', isStarGraph);
	api.updateVisibility('processGraphOrientation', isProcessGraph);

	// Update values for related properties after update of trigger property
	if (trigger === 'projectId') {
		api.updateValue('starDiagramCenterNode', null);
		api.updateValue('diagramType', 'process');
	}
	if (trigger === 'diagramType')
		api.updateValue('starDiagramCenterNode', null);

	// Apply backward compatibility fix for renamed property 'title' to 'headerTitle'
	// In fact we still have the old property 'title' in the component, but it is invisible
	// And its value is automatically copied to new property 'headerTitle' in case it is empty
	api.updateVisibility('title', false);
	if (properties.title && !properties.headerTitle) {
		api.updateValue('headerTitle', properties.title);
		api.updateValue('title', '');
	}

	// Apply logic to header-related properties work the same way as in other PA components
	// Especially important is magical `updateInterfaceMetadata` for PA color selectors
	// Reference: https://code.devsnc.com/dev/app-data-visualizations/blob/ci/master/visualization-components/indicator-scorecard/src/config-policy.js
	api.updateVisibility('headerTitle', properties.showHeader);
	api.updateVisibility('description', properties.showHeader);
	api.updateVisibility('showHeaderSeparator', properties.showHeader);
	api.updateVisibility('wrapTitle', properties.showHeader);
	api.updateVisibility('bareBorder', !properties.showBorder);

	const HEADER_DEFAULT_COLOR = { value: '#FFFFFF', themeVariable: '--now-color_background--primary' };
	const DEFAULT_TEXT_COLOR = { value: '#4F5C62', themeVariable: '--now-color_text--tertiary' };

	api.updateInterfaceMetadata('par-header-color-selector', 'propId', 'headerColor');
	api.updateInterfaceMetadata('par-header-color-selector', 'displayColor', properties.headerColor);
	api.updateInterfaceMetadata('par-header-color-selector', 'defaultColor', HEADER_DEFAULT_COLOR);
	api.updateInterfaceMetadata('par-header-color-selector', 'colorCategories', ['defaultBackgroundColor', 'backgroundColors']);
	api.updateInterfaceMetadata('par-header-color-selector', 'label', 'Header background color');
	api.updateInterfaceMetadata('par-header-color-selector', 'tooltipContent', 'Choose a header background color to align with your theme, branding, or design preferences. The selected color applies only to the header of this visualization. For better accessibility, ensure sufficient contrast between the header background and title text. Use the contrast ratio checker within the color picker to verify. Note that theming is not supported when selecting a custom color.');
	api.updateVisibility('par-header-color-selector', properties.showHeader);
	api.updateVisibility('headerColor', properties.showHeader);

	api.updateInterfaceMetadata('par-title-color-selector', 'propId', 'titleColor');
	api.updateInterfaceMetadata('par-title-color-selector', 'colorCategories', ['defaultTextColor', 'textColors']);
	api.updateInterfaceMetadata('par-title-color-selector', 'label', 'Title color');
	api.updateInterfaceMetadata('par-title-color-selector', 'comparisonColor', properties.headerColor && Object.keys(properties.headerColor).length > 0 ? properties.headerColor : HEADER_DEFAULT_COLOR);
	api.updateInterfaceMetadata('par-title-color-selector', 'displayColor', properties.titleColor);
	api.updateInterfaceMetadata('par-title-color-selector', 'defaultColor', DEFAULT_TEXT_COLOR);
	api.updateInterfaceMetadata('par-title-color-selector', 'tooltipContent', 'Select a color for the chart title to align it with your dashboard theme, branding, or design preferences. The chosen color will apply only to the title of the visualization. For better accessibility, ensure sufficient contrast between the header background and title text. You can verify this by checking the contrast ratio within the color picker. Note that theming is not supported when selecting a custom color.');
	api.updateVisibility('par-title-color-selector', !!(properties.showHeader && (properties.headerTitle || properties.title)));
	api.updateVisibility('titleColor', !!(properties.showHeader && (properties.headerTitle || properties.title)));
	// End of magic for PA header component
}
