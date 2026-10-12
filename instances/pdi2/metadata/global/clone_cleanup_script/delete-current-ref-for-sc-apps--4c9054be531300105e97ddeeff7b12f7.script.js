var gr = new GlideRecord('sys_repo_config');
gr.query();
gs.info('Set current ref for SC apps post clone script processing ' + gr.getRowCount() + ' repository configurations.');
while (gr.next()) {
	var tagName = '';
	var currentRef = '';
	var appId = gr.getValue('sys_app');
	var repoId = gr.getUniqueValue();
	gs.info('Updating current ref for repo ' + repoId + ' for app ' + appId);

	var custGr = new GlideRecord('sys_app_customization');
	custGr.addQuery('vendor_app', appId);
	custGr.query();
	if (custGr.next()) {
		if (custGr.getValue('version') === 'none') {
			gs.info('The customization is not currently installed');
		} else {
			tagName = custGr.getValue('version');
			gs.info('Current customization version ' + tagName);
		}
	} else {
		var appGr = new GlideRecord('sys_app');
		if (appGr.get(appId)) {
			tagName = appGr.getValue('version');
			gs.info('Current app version ' + tagName);
		}
	}

	if (tagName !== '') {
		var tagGr = new GlideRecord('sys_repo_tag');
		tagGr.addQuery('sys_repo_config', repoId);
		tagGr.addQuery('name', tagName);
		tagGr.query();
		if (tagGr.next())
			currentRef = tagGr.getValue('object_id');
	}

	gs.info('Setting current ref to ' + currentRef + ' for repo ' + repoId);
	gr.setValue('current_ref', currentRef);
	gr.update();
}
