if (!pm.isZboot()) {
    var gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'v_ais_result_improvement_rule_condition_builder_values');
    gr.addQuery('element=user_agent');
    gr.query();
    if (gr.next()) {
        gr.setValue(gr.getDisplayName(), "User Context - User Agent");
        gr.update();
    }

    gr = new GlideRecord('sys_dictionary');
    gr.addQuery('name', 'v_ais_result_improvement_rule_condition_builder_values');
    gr.addQuery('element=user_agent_browser');
    gr.query();
    if (gr.next()) {
        gr.setValue(gr.getDisplayName(), "User Context - User Browser Agent");
        gr.update();
    }

}
