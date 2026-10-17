function transform(input) {
    var trigger = input.policyType;
    if (trigger) {
        // create a new custom policy record
        var customPolicy = new GlideRecord("sn_vsc_security_policy");
        customPolicy.initialize();
        customPolicy.name = "New custom policy";
        customPolicy.status = "inactive";
        customPolicy.trigger = trigger;
        customPolicy.settings = "not_configured";
        customPolicy.policy_type = "custom";
        var sysId = customPolicy.insert();
        if (sysId) {
            return sysId;
        } else {
            return '';
        }
    }
}
