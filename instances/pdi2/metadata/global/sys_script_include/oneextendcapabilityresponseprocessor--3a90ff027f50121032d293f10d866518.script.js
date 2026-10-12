var OneExtendCapabilityResponseProcessor = Class.create();
OneExtendCapabilityResponseProcessor.prototype = {
    initialize: function() {},
    PROXY_SKILL_STEP1_ID: "6a5d12fa7f0f02105bc49fbefc866562",

    // This method gets called on a successful feature response for a given feature in One Api Execution.
    /**
    
      {
        "requestId" : "asasdw313212dsdfds",
        "status" : "success",
        "meta" : {
        },
        "result" : {
        },
        "errors" : []
      }
    */
    processSuccess: function(featureResponse) {
        var capabilityId = featureResponse?.requestPayload?._meta?.capability;
        if (capabilityId != this.PROXY_SKILL_STEP1_ID) {
            sn_one_extend.OneExtendUtil.processSuccess(featureResponse);
        }
    },

    // This method gets called on a failure feature response for a given feature in One Api Execution.
    /**
  
    {
      "requestId" : "asasdw313212dsdfds",
      "status" : "failure",
      "meta" : {
      },
      "result" : {
      },
      "errors" : []
    }
  */
    processFailure: function(featureResponse) {
        sn_one_extend.OneExtendUtil.processFailure(featureResponse);
    },

    processSkipped: function(featureResponse) {
        sn_one_extend.OneExtendUtil.processSkipped(featureResponse);
    },

    processCancelled: function(featureResponse) {
        sn_one_extend.OneExtendUtil.processCancelled(featureResponse);
    },

    type: 'OneExtendCapabilityResponseProcessor'
};
