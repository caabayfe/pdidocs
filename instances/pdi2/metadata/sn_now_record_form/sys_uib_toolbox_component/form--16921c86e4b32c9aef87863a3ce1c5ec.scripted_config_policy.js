// eslint-disable-next-line no-unused-vars
function columnLayoutPolicy(args) {
	const { api, properties } = args;
	const {
		isContextMenuHidden,
		isSectionTitleHidden,
		isFirstSectionTitleHidden,
		enableUnsavedFieldIndicator
	} = properties;

	api.updateVisibility('isRemovePaddingLeft', isContextMenuHidden);
	api.updateVisibility('isSectionMenuHidden', !isContextMenuHidden);
	api.updateVisibility('isFormOptionsHidden', !isContextMenuHidden);
	api.updateVisibility('isViewSectionHidden', !isContextMenuHidden);

	api.updateVisibility('isSectionTitleHidden', !isFirstSectionTitleHidden);
	api.updateVisibility('isFirstSectionTitleHidden', !isSectionTitleHidden);
	api.updateVisibility('sectionHeadingLevel', !isSectionTitleHidden);

	api.updateVisibility(
		'enableBgColorForUnsavedFieldIndicator',
		enableUnsavedFieldIndicator ||
			api.isDynamic('enableUnsavedFieldIndicator')
	);
}
