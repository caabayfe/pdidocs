// eslint-disable-next-line no-unused-vars
function activityPolicy(args) {
	const { api, properties } = args;
	const { tagsDataSource } = properties;

	if (!tagsDataSource || tagsDataSource === '') {
		api.updateSectionVisibility('tags', true);
		api.updateSectionVisibility('tags_binding', false);
	}

	if (tagsDataSource === 'static') {
		api.updateSectionVisibility('tags', true);
		api.updateSectionVisibility('tags_binding', false);
	}

	if (tagsDataSource === 'dynamic') {
		api.updateSectionVisibility('tags', false);
		api.updateSectionVisibility('tags_binding', true);
	}

	api.updateValue('tagEditorIsVisible', tagsDataSource === 'static');
	api.updateValue('showTags', tagsDataSource !== '');
}
