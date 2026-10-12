function onChange(control, oldValue, newValue, isLoading, isTemplate) {
    if (newValue === '') {
        g_form.setValue('client_conditions', '{}');
        return;
    }

    var gr = new GlideRecord('sys_declarative_action_model_field');
    gr.addQuery('sys_id', 'IN', newValue);
    gr.query();

    var attr = [];
    while (gr.next()) {
        attr.push(gr.getValue('field_label'));
    }

    var keyPairObj = attr.reduce(function(acc, current) {
        acc[current] = '';
        return acc;
    }, {});

    var currentConditions = JSON.parse(g_form.getValue('client_conditions') || '{}');
    var merged = merge(keyPairObj, currentConditions);
	
    g_form.setValue('client_conditions', JSON.stringify(merged));

}

function merge(target, source) {
	return Object.keys(target).reduce(function(merged, key) {
		var value = (source[key]) ? source[key] : target[key];
		merged[key] = value;
		return merged;
	}, {});
}
