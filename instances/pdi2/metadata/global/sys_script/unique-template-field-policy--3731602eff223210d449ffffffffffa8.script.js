(function executeRule(current, previous /*null when async*/ ) {

    var templateFieldPolicyGr = new GlideRecord('sttrm_template_field_policy');
    templateFieldPolicyGr.addQuery('sttrm_base_template', current.getValue('sttrm_base_template'));
    templateFieldPolicyGr.addQuery('name', current.getValue('name'));
    templateFieldPolicyGr.addQuery('sys_id', '!=', current.getValue('sys_id'));
    templateFieldPolicyGr.query();

    if (templateFieldPolicyGr.hasNext()) {
        gs.addErrorMessage(gs.getMessage("A Template Field Policy already exists for the {0} field.", current.getValue('name')));
        current.setAbortAction(true);
    }


})(current, previous);
