(function executeRule(current, previous /*null when async*/ ) {

	/*
	This BR validates if a particular Filter Criteria ia allowed in a Context. e.g
	1. User Based Filter Criteria (Group,  Role, AuthScheme, Identity provider) are not allowed in Pre Auth Context.
	2. MFA Filter Criteria (Role Based MFA, User Based MFA) can only be used in MFA Context.
	*/
    var policySysId;
    var decisionTable = current.decision_table;
    var currentFields;
    var policyGR = new GlideRecord('sys_authentication_policy');
    policyGR.addQuery('decision_table', decisionTable);
    policyGR.query();
    if (policyGR.next())
        policySysId = policyGR.getUniqueValue();


    var policyContextGR = new GlideRecord('sys_auth_policy_context');
    policyContextGR.query();
    while (policyContextGR.next()) {
        var defaultPolicy = policyContextGR.default_policy;
        var defaultPolicyId = policyContextGR.allow_policy;

        if (defaultPolicy == 'deny_policy')
            defaultPolicyId = policyContextGR.deny_policy;

        if (policySysId == defaultPolicyId) {

            if (!currentFields)
                currentFields = fetchFields(current.condition);
            if (policyContextGR.getUniqueValue() == '62c7e85773112010616ca9843cf6a78e') {
                var gr = new GlideRecord('sys_auth_filter_criteria');
                gr.addQuery('element_name', 'IN', currentFields.join(','));
                gr.addQuery('sys_class_name', 'IN', 'sys_role_filter_criteria,sys_group_filter_criteria, sys_generic_user_filter_criteria');
                gr.query();
                if (gr.next()) {
                    gs.addErrorMessage(gs.getMessage("You can only use the {0}, {1} and {2} criteria in the Pre Authentication Policy Context.", ["IP Filter", "Trusted Mobile App Filter", "Location Based Filter"]));
                    current.setAbortAction(true);
                    return;
                }
            }

            gr = new GlideRecord('sys_generic_user_filter_criteria');
            gr.addQuery('element_name', 'IN', currentFields.join(','));
            gr.addQuery('type', 'IN', 'role_based_mfa,user_based_mfa');
            gr.query();
            if (gr.next()) {
                gs.addErrorMessage(gs.getMessage("User Based MFA and Role Based MFA filters cannot be used in Authentication Policy Context."));
                current.setAbortAction(true);
                return;
            }
        }
    }

    function fetchFields(condition) {
        var finalTerms = [];
        if (!condition)
            return finalTerms;
        var glideQS = new GlideQueryString(current.input_table, condition);
        glideQS.deserialize();
        var queryTerms = glideQS.getTerms();
        for (var i = 0; i < queryTerms.size(); i++) {
            var field = queryTerms.get(i).getField();
            //sometimes field value is null
            if (field != 'null' && field) {
                //fields can be of simple format like 'first_name', 'email' or of dotwalked type like 'user.company.location'
                //if they are not dot walked fields, use them directly, otherwise get the parent field which is being dotwalked
                var dotIndex = field.indexOf('.');
                if (dotIndex < 0)
                    finalTerms.push(String(field));
                else
                    finalTerms.push(field.substring(0, dotIndex));
            }
        }
        return finalTerms;
    }

})(current, previous);
