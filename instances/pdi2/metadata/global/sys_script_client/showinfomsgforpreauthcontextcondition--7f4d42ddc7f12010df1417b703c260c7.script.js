function onLoad() {
    var policySysId;
    var msg = "";
    var decisionTable = g_form.getValue("decision_table");
    var policyGR = new GlideRecord('sys_authentication_policy');
    policyGR.addQuery('decision_table', decisionTable);
    policyGR.query();
    if (policyGR.next())
        policySysId = policyGR.sys_id;

    var policyContextGR = new GlideRecord('sys_auth_policy_context');
    //Get pre-auth policy context
    policyContextGR.get('62c7e85773112010616ca9843cf6a78e');
    if (policyContextGR != null) {
        var defaultPolicy = policyContextGR.default_policy;
        var defaultPolicyId = policyContextGR.allow_policy;

        if(defaultPolicy == 'deny_policy')
            defaultPolicyId = policyContextGR.deny_policy;

        if (policySysId == defaultPolicyId) {
			var preAuthPolicyContextLink = "/sys_auth_policy_context.do?sys_id=62c7e85773112010616ca9843cf6a78e";
            msg = formatMessage(getMessage("You can only use the {1}, {2} and {3} criteria in the <a target='_blank' href='{0}'>Pre Authentication Policy Context.</a>"),[preAuthPolicyContextLink, "IP Filter", "Trusted Mobile App Filter", "Location Filter"]);
            g_form.addInfoMessage(msg);
        }
    }
}
