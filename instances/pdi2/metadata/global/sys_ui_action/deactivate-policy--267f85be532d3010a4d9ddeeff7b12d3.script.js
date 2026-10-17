var defaultPolicy = current.default_policy;
var policyRecord = current.deny_policy;
if (defaultPolicy == 'allow_policy')
	policyRecord = current.allow_policy;
var gr = new GlideRecord("sys_authentication_policy");
gr.get(policyRecord);
gr.setValue("active",false);
gr.update();
action.setRedirectURL(current);
