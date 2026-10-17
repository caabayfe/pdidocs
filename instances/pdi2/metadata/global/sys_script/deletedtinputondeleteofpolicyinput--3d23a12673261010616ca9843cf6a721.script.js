(function executeRule(current, previous /*null when async*/ ) {

    // Delete Decision table inputs (sys_decision_input) associated with current policy, on delete of Policy input
    var gr = new GlideRecord("sys_decision_input");
    if (gr.isValid()) {
        gr.addQuery('name', 'var__m_sys_decision_input_' + current.policy.decision_table);
        gr.addQuery('element', current.sys_auth_filter_criteria.element_name);
        gr.query();
        if (gr.next()) {
            gr.deleteRecord();

            //Delete the choice records which got created as part of Auth Scheme filter
            if (current.sys_auth_filter_criteria.sys_class_name == 'sys_generic_user_filter_criteria' && current.sys_auth_filter_criteria.type == 'auth_scheme')
                 deleteAuthSchemeChoiceRecords();
        }
    }

    function deleteAuthSchemeChoiceRecords() {

        var choiceGR = new GlideRecord("sys_choice");
        choiceGR.addQuery('name', 'var__m_sys_decision_input_' + current.policy.decision_table);
        choiceGR.addQuery('element', current.sys_auth_filter_criteria.element_name);
        choiceGR.query();
        //Delete both the choice records (local, sso)
        if (choiceGR.next())
            choiceGR.deleteMultiple();
    }

})(current, previous);
