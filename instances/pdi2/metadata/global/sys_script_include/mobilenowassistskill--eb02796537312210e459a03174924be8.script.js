var MobileNowAssistSkill = Class.create();
MobileNowAssistSkill.prototype = {
    initialize: function() {
        this.result = {};
    },

    callout: function(executionRequest, context) {
        executionRequest = JSON.parse(executionRequest);
        context = JSON.parse(context);
        var mode = executionRequest["mode"];
        var pollId = executionRequest["pollId"];
        var inputMapping = executionRequest["payload"];
        var capabilityId = executionRequest["capabilityId"];
        var skillConfigId = executionRequest["skillConfigId"];
        var payload = this._generateInputPayload(capabilityId, context, inputMapping);

        var request = {
            executionRequests: [{
                payload: payload,
                "meta": {
                    "skillConfigId": skillConfigId
                },
                "returnRequest": true,
                capabilityId: capabilityId
            }],
            meta: {"skillAclInvocationMode": "ENFORCE_ACL_STRICT_MODE"},
        };
        if (mode == "async") {
            request.mode = "async";
            request.callbackHandler = "MobileAsyncCallbackHandler";
        }
        var oneExtendOutput = sn_one_extend.OneExtendUtil.executeSecure(request);

        if (mode == "async") {
            this.verifyAsyncConfirmation(oneExtendOutput, request, capabilityId, pollId);
        } else {
            this.verifySyncResponse(oneExtendOutput, capabilityId);
        }

        return this.result;
    },

    callback: function(pollId) {
        var gr = new GlideRecord("sys_sg_async_service_request");
        gr.addQuery("poll_id", pollId);
        gr.query();
        if (gr.next()) {
            var request = JSON.parse(gr.getValue("request_payload"));
            var response = JSON.parse(gr.getValue("response_payload"));
            var status = gr.getValue("status");
            var capabilityId = gr.getValue("one_extend_capability");
            if (status === "completed") {
                this.verifySyncResponse(response, capabilityId);
            } else {
                var capabilities = {};
                if (status === "error") {
                    capabilities[capabilityId] = {
                        "error_message": "Error"
                    };
                } else {
                    var pollInterval = gs.getProperty("glide.sg.async.intervalMS") ? gs.getProperty("glide.sg.async.intervalMS") : 1000;
                    var pollTimeout = gs.getProperty("glide.sg.async.timeoutMS") ? gs.getProperty("glide.sg.async.timeoutMS") : 30000;

                    var pollData = {
                        "PollId": pollId,
                        "PollIntervalMillis": pollInterval,
                        "PollTimeoutMillis": pollTimeout
                    };
                    this.result = response;
                    this.result["PollData"] = pollData;
                }
                this.result["capabilities"] = capabilities;
                this.result["status"] = status;
            }
        } else {
            gs.warn("Error: No async request found");
            return;
        }
        return this.result;
    },

    verifySyncResponse: function(response, capabilityId) {
        if ((response == null) || (response["result"] == null)) {
            this.result["status"] = "error";
            this.result["error_message"] = "Invalid result from resolution script";
            return;
        }

        var key = Object.keys(response["result"])[0];
        var capability = response["result"][key]["result"];

        if (capability == null) { //error path
            var message = response["message"];

            if (message == null) {
                gs.warn("No message found in empty capability response");
                message = gs.getMessage("[Empty]");
            }

            this.result["capabilities"] = {};
            this.result["status"] = "error";
            this.result["error_message"] = message;

        } else { //happy path
            this.result["capabilities"] = {};
            this.result["capabilities"][capabilityId] = capability;
            this.result["status"] = "completed";
        }
    },

    verifyAsyncConfirmation: function(response, inputs, capabilityId, pollId) {
        if (response["status"] == "success") {
            var gr = new GlideRecord("sys_sg_async_service_request");

            if (!gs.getUser().hasRole("admin"))
                gr.addQuery("sys_created_by", gs.getUserName());

            gr.addQuery("poll_id", pollId);
            gr.query();

            if (gr.next()) {
                var externalKey = response["transactionId"];
                gr.setValue("external_key", externalKey);
                gr.setValue("status", "pending");
                gr.setValue("request_payload", inputs);
                gr.setValue("one_extend_capability", capabilityId);
                gr.update();

                var pollInterval = gs.getProperty("glide.sg.async.intervalMS") ? gs.getProperty("glide.sg.async.intervalMS") : 1000;
                var pollTimeout = gs.getProperty("glide.sg.async.timeoutMS") ? gs.getProperty("glide.sg.async.timeoutMS") : 30000;

                var pollData = {
                    "PollId": pollId,
                    "PollIntervalMillis": pollInterval,
                    "PollTimeoutMillis": pollTimeout
                };

                response["status"] = "completed";
                this.result = response;
                this.result["capabilities"][capabilityId] = {};
                this.result["capabilities"][capabilityId]["PollData"] = pollData;
                this.result["capabilities"][capabilityId]["status"] = "pending";
                this.result["capabilities"]["message"] = this.result["message"];
            } else { //invalid poll id
                gs.warn("Error: No async request record found");
            }
        } else { //OneExtend error
            gs.warn("Error: Could not initiate async OneExtend Request");
        }
    },

    _generateInputPayload: function(capabilityId, context, inputMapping) {
        var inputsPayload = {};
        var capabilityAttributes = sn_one_extend.OneExtendUtil.getCapabilityAttributes(capabilityId);
        // Adding values to the inputsPayload from the record of the context.
        if (global.JSUtil.notNil(capabilityAttributes)) {
            var inputs = capabilityAttributes["inputs"];
            var current = new GlideRecord(context["TableName"]);
            if (current.get(context["RecordId"])) {
                for (var i = 0; i < inputs.length; i++) {
                    var input = inputs[i];
                    var attributeName = input["attributeName"] || "";
                    var attributeDataType = input["attributeDataType"] || "";
                    if (global.JSUtil.notNil(attributeName)) {
                        if (attributeDataType === 'glide_record') {
                            var schema = input["schema"] || {};
                            var tableName = schema["tableName"] || "";
                            inputsPayload[attributeName] = {
                                tableName: tableName,
                                sysId: current.getValue('sys_id'),
                                queryString: ''
                            };
                        } else {
                            var attributeValue = current.getValue(attributeName);
                            inputsPayload[attributeName] = attributeValue === null || attributeValue === undefined ? "" : attributeValue;
                        }

                    }
                }
            }
        }
        // populating the inputPayload with the data coming from the input mapping in UI Rule Action execution
        for (var key in inputMapping) {
            if (inputMapping.hasOwnProperty(key))
                inputsPayload[key] = inputMapping[key];
        }
        return inputsPayload;
    },

    type: 'MobileNowAssistSkill'
};
