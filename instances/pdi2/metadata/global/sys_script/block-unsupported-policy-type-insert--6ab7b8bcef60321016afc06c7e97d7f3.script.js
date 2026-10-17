(function executeRule(current, previous /*null when async*/ ) {

    var dpSecurityUtil = new global.DataPrivacySecurityUtil();
    var hasAccessToConfigure = dpSecurityUtil.canConfigurePolicyType(current.channel.toString(), current.policy_type.toString());
    if (!hasAccessToConfigure) {
        gs.addErrorMessage(gs.getMessage('Insufficient access to create {0} policy.', current.getDisplayValue('policy_type')));
        current.setAbortAction(true);
    }

})(current, previous);
