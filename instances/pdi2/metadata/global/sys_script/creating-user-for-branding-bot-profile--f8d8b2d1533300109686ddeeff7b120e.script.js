(function executeRule(current, previous /*null when async*/ ) {

    var gr = new GlideRecord('sys_user');
    gr.setValue('user_name', current.getValue('name').toLowerCase().replace(/\s/g, '.'));
    gr.setValue('first_name', current.getValue('name'));
    gr.setValue('last_name', "VA Bot User");
    // override data policies
    gr.setUseEngines(false);
    // bypass business rules
    gr.setWorkflow(false);
    gr.insert();

    current.setValue('table', 'sys_user');
    current.setValue('document', gr.getUniqueValue());
    current.update();

})(current, previous);
