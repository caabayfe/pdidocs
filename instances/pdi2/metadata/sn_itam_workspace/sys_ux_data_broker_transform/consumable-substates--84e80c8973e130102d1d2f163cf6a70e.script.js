function transform() {
	var current_language = gs.getSession().getLanguage();
	var results = [];
	new global.GlideQuery('sys_choice')
	.where('name', 'alm_asset')
	.where('element', 'substatus')
	.where('dependent_value', '6')
	.where('value', 'NOT IN', ['pre_allocated','pending_transfer','pending_install'])
	.where('language', current_language)
	.select('value', 'sys_id', 'label')
	.forEach(function(substate) {
		var data = {};
        data['id'] = substate.value;
        data['label'] = substate.label;
        results.push(data);	
	});
	return results;
}
