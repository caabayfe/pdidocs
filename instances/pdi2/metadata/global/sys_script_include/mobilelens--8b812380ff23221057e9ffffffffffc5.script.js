var MobileLens = Class.create();
MobileLens.prototype = {
    CAPABILITY_ID: "a20d776cff376210b975ffffffffff56",
    initialize: function() {
        this.result = {};
    },

    callout: function(executionRequest, inputJSON) {
        executionRequest = JSON.parse(executionRequest);
        var pollId = executionRequest["pollId"];
        var payload = executionRequest["payload"];
        var userPrompt = payload["userPrompt"];
        var attachmentIds = payload["attachmentIds"];
        var parameterScreenId = payload["parameterScreenId"];
        var inputNames = payload["inputNames"];
        var actionId = this.CAPABILITY_ID;
        var additionalContext = {
			IsFileUploadEnabled: true
		};

        var syncResponse = new sn_app_lens_core.AILensActionService().invokeLens(actionId, attachmentIds, userPrompt, [], JSON.parse(inputJSON), true, additionalContext);

        this.verifySyncResponse(syncResponse);

        return this.result;
    },

    verifySyncResponse: function(response) {
        const result = this.result;
        const capabilities = result["capabilities"] = {};
        const capId = this.CAPABILITY_ID;
        capabilities[capId] = response;

        if (!response || response.status !== "success") {
            result.status = "error";
            result.error_message = "Invalid result from lens script";
            capabilities[capId]["error_message"] = "An error occurred while executing an one extend plan";
            return;
        }

        result.status = (response.status != "error") ? "completed" : "error";
    },

    type: 'MobileLens'
};
