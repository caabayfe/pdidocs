function transform(input) {
	var results = [];
	var gr = new GlideRecord('sys_choice');
	var current_language = gs.getSession().getLanguage();
	gr.addQuery('name', 'alm_asset');
	gr.addQuery('element', 'asset_function');
	gr.addQuery('language', current_language);
	gr.addQuery('value', 'NOT IN', ['asset_bundle']);
	gr.query();

	results.push({
		'id' : 'none',
		'value' : '',
		'label' : gs.getMessage('-- None --')
	});

	while (gr.next()) {
		results.push({
			'id' : gr.value.toString(),
			'value' : gr.value.toString(),
			'label' : gr.label.toString()
		});
	}
	return results;
}
