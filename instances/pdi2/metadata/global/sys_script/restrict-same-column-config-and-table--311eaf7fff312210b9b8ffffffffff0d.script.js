(function executeRule(current, previous /*null when async*/ ) {
    var gr = new GlideRecord('product_instance_identifier_parameters');
    gr.addQuery('pid_configuration', current.pid_configuration);
    gr.addQuery('parameter_class_name', current.parameter_class_name);
    gr.addQuery('parameter_class_attribute_name', current.parameter_class_attribute_name);
    gr.addQuery('sys_id', '!=', current.sys_id);
    gr.setLimit(1);
    gr.query();

    if (gr.hasNext()) {
        gs.addErrorMessage(gs.getMessage('Cannot have same Column name, Table Name and PID Configuration for multiple parameter rows.'));
        current.setAbortAction(true);
    }

})(current, previous);
