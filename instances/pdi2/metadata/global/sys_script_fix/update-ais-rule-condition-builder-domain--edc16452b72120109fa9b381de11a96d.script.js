if (!pm.isZboot()) {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'v_ais_result_improvement_rule_condition_builder_values');
    gr.addQuery('element=domain');
    gr.query();
    if (gr.next()) {
        gr.setValue('reference', "NULL");
		gr.setValue('reference_cascade_rule', "NULL");
		gr.setValue('reference_qual_condition', "NULL");
		gr.setValue('use_dependent_field', 0);
        gr.setValue('choice', 0);
        gr.update();
    }
}
