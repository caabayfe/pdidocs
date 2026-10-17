(function executeRule(current, previous /*null when async*/ ) {

    // Validate that the updating the properties will not result in blocking the user session.
    try {
        var isValid = SNC.AuthPolicyIPUtil.validateEnableAuthPolicyPropertyChange(current, previous);
        if (!isValid) {
            gs.addErrorMessage(gs.getMessage("Current session may get blocked by the Authentication policies attached to the Pre Authentication  Context due to this operation. Aborting the operation."));
            current.setAbortAction(true);
        }
    } catch (ex) {
        message = "Exception while validating glide.authenticate.auth.policy.enabled property update.";
        message += ex.message;
        gs.error(message);
        return;
    }

    // Check if MFA property need to be enabled on enabling the Adaptive auth Property
    if (gs.getProperty('glide.authenticate.multifactor') != 'true') {
        var policyId = fetchDefaultPolicyReferencedInMFAContextRecord();
        if (GlideStringUtil.notNil(policyId) && isAuthPolicyRecordActive(policyId)) {
            // Enable the MFA Property
            var glideRecord = new GlideRecord("sys_properties");
            // 562c1882d713310091204187ed6103b9 - sysId of Property glide.authenticate.multifactor
            glideRecord.get("562c1882d713310091204187ed6103b9");
            if (glideRecord.isValidRecord()) {
                glideRecord.setValue("value", "true");
                glideRecord.update();
                gs.info("Property glide.authenticate.multifactor is updated to true.");
            }
        }
    }

    function isAuthPolicyRecordActive(policyId) {
        var glideRecord = new GlideRecord("sys_authentication_policy");
        glideRecord.addActiveQuery();
        glideRecord.addQuery("sys_id", policyId);
        glideRecord.addQuery("type", "!=", 'any');
        glideRecord.query();
        if (glideRecord.next())
            return true;
        return false;
    }

    function fetchDefaultPolicyReferencedInMFAContextRecord() {
        var glideRecord = new GlideRecord("sys_mfa_policy_context");
        glideRecord.get('c4895d9373512010616ca9843cf6a79f');
        if (glideRecord.isValidRecord()) {
            var defaultPolicy = glideRecord.getValue("default_policy");
            return glideRecord.getValue(defaultPolicy);
        }
        return null;
    }

})(current, previous);
