var defaultPolicy = current.default_policy;
var policyRecord = current.stepup_mfa_policy;
        if (defaultPolicy == 'stepdown_mfa_policy')
            policyRecord = current.stepdown_mfa_policy;
var gr = new GlideRecord("sys_authentication_policy");
gr.get(policyRecord);
gr.setValue("active",false);
gr.update();
action.setRedirectURL(current);
