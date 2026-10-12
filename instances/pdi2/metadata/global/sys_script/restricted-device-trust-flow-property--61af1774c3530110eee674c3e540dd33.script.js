(function executeRule(current, previous /*null when async*/ ) {

    // Add your code here
    var policyConditonGr = new GlideRecord('sys_auth_policy_condition');
    policyConditonGr.addQuery('condition', 'CONTAINS', 'global_cb0c4148c33201102c5b4e483c40dd56');
    policyConditonGr.addQuery('active', true);
    policyConditonGr.query();

    if (policyConditonGr.next()) {
        gs.addErrorMessage(gs.getMessage("You must remove the Trusted Mobile app conditions from the Pre Authentication Policy Context and disable the property."));
        current.setAbortAction(true);
    }

})(current, previous);
