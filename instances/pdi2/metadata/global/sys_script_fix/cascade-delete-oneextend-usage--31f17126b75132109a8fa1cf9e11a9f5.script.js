(function() {
	var update_reference_cascade_rule = function(table_name, element) {
        var gr = new GlideRecord('sys_dictionary');
        gr.addQuery('name', table_name);
        gr.addQuery('element', element);
        gr.query();
        if (gr.next()) {
            gr.setValue('reference_cascade_rule', 'delete');
            return gr.update();
        }
    };	
	
    update_reference_cascade_rule('sys_one_extend_usage', 'plan');
    return;
})();
