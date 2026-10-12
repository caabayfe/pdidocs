var gr = new GlideRecord('sys_cs_topic');
gr.query();
while (gr.next()) {
	var fields = gr.getFields();

	var isSystemTopicValue;
	var isVisibleValue;
	var isPublishedValue = false;
	for (var i = 0; i < fields.size(); i++) {
		var f = fields.get(i);
		if (f.getName() === 'is_system_topic') {
			isSystemTopicValue = (gs.nil(f) ? null : f);
		} else if (f.getName() === 'visible') {
			isVisibleValue = (gs.nil(f) ? null : f);
		} else if (f.getName() === 'published') {
			isPublishedValue = (gs.nil(f) ? false : f);
		}
	}

	if (isSystemTopicValue) {
		gr.setValue('visible', false);
		gr.update();
	} else if (gs.nil(isVisibleValue)) {
		gr.setValue('visible', (isPublishedValue && (gs.nil(isSystemTopicValue) || !isSystemTopicValue)));
		gr.update();
	}
}
