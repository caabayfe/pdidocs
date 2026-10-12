// This file sets logical behavior for the now-list config panel in UIB
// e.g. disabling properties that depending on other props, etc

//eslint-disable-next-line no-unused-vars
function nowListPolicy(/** @type {any} */ { api, trigger, properties }) {
	// Default display

	const isBootstrap = trigger === null;

	if (trigger === 'columnDefinitions') {
		api.updateEnabled(
			'rowDefinitions',
			!(Object.keys(properties.columnDefinitions).length === 0)
		);
		api.updateSectionVisibility(
			'featureFlags',
			!(Object.keys(properties.columnDefinitions).length === 0)
		);
	}
	if (trigger === 'rowDefinitions') {
		const rowDependencies = [
			'expandAllGroups',
			'rowDragDropEnabled',
			'selectionEnabled',
			'cellEditingEnabled',
			'cellEditingManaged',
		];
		rowDependencies.map((propName) => {
			api.updateVisibility(
				propName,
				!(Object.keys(properties.rowDefinitions).length === 0)
			);
		});
	}
	if (trigger === 'cellEditingEnabled') {
		api.updateVisibility(
			'cellEditingManaged',
			properties.cellEditingEnabled
		);
	}
	if (trigger === 'selectionEnabled') {
		api.updateVisibility('selectAllEnabled', properties.selectionEnabled);
	}

	const propsNotSupportedInGalleryLayout = [
		'shadeAlternateRows',
		'wrapCellContent',
		'maxCharacters',
		'selectAllEnabled',
		'columnFilteringEnabled',
		'columnResizingEnabled',
		'columnDragDropEnabled',
		'rowDragDropEnabled',
		'cellEditingEnabled',
		'cellEditingManaged',
		'popoverDefinition',
	];

	if (trigger === 'layout' || isBootstrap) {
		propsNotSupportedInGalleryLayout.map((propName) => {
			api.updateVisibility(propName, properties.layout !== 'gallery');
		});
	}
}

export default nowListPolicy;
