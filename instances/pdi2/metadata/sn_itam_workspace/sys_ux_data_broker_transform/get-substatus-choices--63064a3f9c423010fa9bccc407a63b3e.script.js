function transofrm(input) {
	var results = [];
	var gr = new GlideRecord('sys_choice');
	var current_language = gs.getSession().getLanguage();
	gr.addQuery('name', 'alm_asset');
	gr.addQuery('element', 'substatus');
	gr.addQuery('dependent_value', input.status);
	gr.addQuery('value', 'NOT IN', ['pre_allocated']);
	gr.addQuery('language', current_language);
	gr.query();
	while (gr.next()) {
		results.push({
		'id' : gr.value.toString(),
		'value' : gr.value.toString(),
		'label' : gr.label.toString()
		});
	}
	return results;
}
