var ServicePlanFeatureExecutor = Class.create();
ServicePlanFeatureExecutor.prototype = {
    initialize: function() {
        this.BATCH_RUN_TYPES = {
            EVAL_RUN: "eval_run",
            AUTO_PROMPT_TUNING: "auto_prompt_tuning",
            TEST_RUN: "test_run"
        };
        this.EXECUTION_MODE = {
            EVAL: "eval",
            ASYNC: "async",
            SYNC: "sync",
            FIRE_AND_FORGET: "fire_and_forget",
            STREAM: "stream"
        };
    },

    execute: function(inputs) {
        if (inputs.mode === this.EXECUTION_MODE.SYNC) {
            return this._oneExtendExecute(inputs);
        }

        // setting callback to process the main graph transition node once subgraph execution completes
        var featureInvId = inputs["feature_invocation_id"];
        inputs.oneApiServicePlanCallback = {
            "featureInvId": featureInvId
        };
        return this._oneExtendExecute(inputs);
    },

    _oneExtendExecute: function(inputs) {
        var evaluationDetails = this._getEvaluationDetails(inputs._meta);
        var batchRunType = evaluationDetails.batchRunType;

        if (batchRunType == this.BATCH_RUN_TYPES.EVAL_RUN || batchRunType == this.BATCH_RUN_TYPES.TEST_RUN){
            inputs.caller = "Now assist skill kit";
        }

        var request = {
            "executionRequests": [{
                "payload": inputs,
                "capabilityId": inputs._meta.capability,
                "meta": {
                    "evaluationDetails": evaluationDetails,
                    "skillConfigId": inputs._meta.skillConfigId || "",
                    "requestOrigin": inputs._meta.requestOrigin || "",
                    "__chaining_overrides__": inputs._meta.__chaining_overrides__ || {},
                    "__defaultToolDefinitionAPIs__": inputs._meta.__defaultToolDefinitionAPIs__ || JSON.stringify({}),
                    "isSubGraph": true,
                    "documentId":inputs._meta.documentId,
                    "documentTable":inputs._meta.documentTable
                }
            }],
            "mode": this._getMode(inputs),
			"meta": {
				"parentServicePlanInvId": inputs._meta.service_plan_invocation_id || ""

			}
        };
        if (batchRunType == "auto_prompt_tuning")
            request.executionRequests[0].meta.invocation_source = "prompt_optimization";

        var supportedKeys = ["runAsUser", "enableNativeTranslation", "enableDynamicTranslation"];
        for (var idx = 0; idx < supportedKeys.length; idx++) {
            this._checkAndAddPropertyToMeta(request, inputs, supportedKeys[idx]);
        }
        return sn_one_extend.OneExtendUtil.execute(request);
    },

    _checkAndAddPropertyToMeta: function(request, inputs, propName) {
        if (inputs._meta.hasOwnProperty(propName)) {
            request.executionRequests[0].meta[propName] = inputs._meta[propName];
        }
    },

    _getMode: function(inputs) {
        var mode = inputs.mode;
        if (gs.nil(inputs._meta.evaluationDetails)) {
            return mode;
        }
        var batchRunType = inputs._meta.evaluationDetails.batchRunType || "";
        if (batchRunType === this.BATCH_RUN_TYPES.AUTO_PROMPT_TUNING || batchRunType === this.BATCH_RUN_TYPES.EVAL_RUN) {
            return this.EXECUTION_MODE.EVAL;
        }
        return mode;
    },

    _getEvaluationDetails: function(meta) {
        if (meta.capability_type == "metric") {
            return meta.evaluationDetails || {};
        }
        var evalDetails = {
            batchRunType: "",
        };
        if (gs.nil(meta.evaluationDetails)) {
            return evalDetails;
        }
        evalDetails.batchRunType = meta.evaluationDetails.batchRunType || "";
        return evalDetails;
    },

    type: 'ServicePlanFeatureExecutor'
};
