/*
    ===================================================================
    After the instance is cloned, if any IDP related filter criterias(Identity Provider or IDP Attributes) 
    are being used in the policy conditions of the adaptive authentication, and adaptive authentication is
    enabled, then it will disable such policies which have above filters associated.
    ===================================================================
*/
this.logInfo("Started running post clone cleantup script - Fix Adaptive Auth with IDP Filters");
try {
    disableAdaptiveAuthPolicyHavingIDPFilters();
    this.logInfo("Completed running script Fix Adaptive Auth with IDP Filters");
} catch (e) {
    this.logError("Exception occured while running script Fix Adaptive Auth with IDP Filters. " + e.message);
    this.logError(e);
}

function disableAdaptiveAuthPolicyHavingIDPFilters() {
      var m2mGr = new GlideRecord("sys_authentication_policy_criteria_m2m");
      if (m2mGr.isValid()) {
          m2mGr.addEncodedQuery("sys_auth_filter_criteria.ref_sys_generic_user_filter_criteria.typeINidentity_provider,idp_attribute^policy.active=true^used=true");
          m2mGr.query();
          while (m2mGr.next()) {
              var policyId = m2mGr.getValue("policy");
              //disable the AA Policy if its active..
              if(m2mGr.policy.active){
                  this.logInfo("Disabling Adaptive Authentication policy: " + policyId);
                  disablePolicy(policyId);
              }
          }
      }
}

function disablePolicy(policyId) {
    var policyGr = new GlideRecord("sys_authentication_policy");
    if (policyGr.isValid()) {
        policyGr.get(policyId);
        policyGr.setValue("active", "false");
        var result = policyGr.update();
        if (GlideStringUtil.notNil(result)) {
            this.logInfo("Adaptive Auth Policy disabled due to missing filters:" + policyId);
        }
    }
}

function logInfo(message) {
    gs.info("post_clone: AdaptiveAuth: " + message);
}

function logError(message) {
    gs.error("post_clone: AdaptiveAuth: " + message);
}
