function onChange(control, oldValue, newValue, isLoading, isTemplate) {
	if (isLoading || newValue === '') {
		return;
	}

	var tagIds = g_form.getValue('tags');

	var tagRecord = new GlideRecord('label');
	tagRecord.addQuery('sys_id', 'IN', tagIds);
	tagRecord.query();

	var privateTags = [];
	var publicTags = [];

	while (tagRecord.next()) {
		if (tagRecord.getValue('viewable_by') === 'me') {
			privateTags.push(tagRecord.getValue('name'));
		} else {
			publicTags.push(tagRecord.getValue('sys_id'));
		}
	}
	
	if (privateTags.length === 0)
		return;

	g_form.clearMessages();

	g_form.addErrorMessage(formatMessage(getMessage("The following tag(s) are not allowed as they are private and are visible only to the tag owners : {0}"), privateTags.join(', ')));

	g_form.setValue('tags', publicTags);

}
