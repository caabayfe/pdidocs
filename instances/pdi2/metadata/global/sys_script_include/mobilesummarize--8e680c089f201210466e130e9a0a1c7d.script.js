var MobileSummarize = Class.create();
MobileSummarize.prototype = {
	CAPABILITY_ID: "ce064fd10127a510f877ab5e150e4896",
    initialize: function() {
		this.result = {};
    },

	callout: function(executionRequest) {
		executionRequest = JSON.parse(executionRequest);
		var mode = executionRequest["mode"];
		var pollId = executionRequest["pollId"];
        var payload = executionRequest["payload"];
        var documentId = payload["documentId"];
        var documentTable = payload["documentTable"];
		var requestDetails = null;

		if (mode == "async") {
			requestDetails = {
				mode: "async",
				callBackHandler: "MobileAsyncCallbackHandler"
			};
			requestDetails = JSON.stringify(requestDetails);
		}

		var tableConfigs = this.fetchConfigsFromUXC(documentTable, documentId);

		var requestPayload = JSON.stringify(this.getRequestPayloadFromUXC(documentTable, documentId, tableConfigs, "mobile", null, requestDetails));

        var syncResponse = JSON.parse(this.summarizeFromUXC(documentTable, documentId, tableConfigs, "mobile", requestDetails));

		if (mode == "async") {
			this.verifyAsyncConfirmation(syncResponse, requestPayload, pollId);
		} else {
			this.verifySyncResponse(syncResponse);
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

			if (status === "completed") {
				var key = Object.keys(response["result"])[0];
				var responsePayload = response["result"][key]["result"];
				var metaData = request["_meta"];
				var documentId = metaData["documentId"];
				var documentTable = metaData["documentTable"];
				var summary = this.formatResponseFromUXC(documentTable, documentId, request, responsePayload);
				this.verifySyncResponse(summary, null);
			} else {
				var capabilities = {};

				if (status === "error") {
					capabilities[this.CAPABILITY_ID] = {"error_message": "An error occurred while executing an one extend plan"};
				} else {
					var pollInterval = gs.getProperty("glide.sg.async.intervalMS") ? gs.getProperty("glide.sg.async.intervalMS") : 1000;
					var pollTimeout = gs.getProperty("glide.sg.async.timeoutMS") ? gs.getProperty("glide.sg.async.timeoutMS") : 30000;

					var pollData = {"PollId": pollId, "PollIntervalMillis": pollInterval, "PollTimeoutMillis":pollTimeout};
					this.result = response;
					this.result["PollData"] = pollData;
				}

				this.result["capabilities"] = capabilities;
				this.result["status"] = status;
			}

			this.result["transactionId"] = response["transactionId"];
			this.result["startedAt"] = response["startedAt"];
			this.result["planId"] = response["planId"];
			this.result["completedAt"] = response["completedAt"];

			return this.result;
		} else {
			gs.warn("Error: No async request record found");
			return;
		}
	},

	getSummary: function(inputTable, inputSysId, inputCaller) {
		var summary = JSON.parse(this.getSummaryFromUXC(inputTable, inputSysId, inputCaller));
		this.verifySyncResponse(summary, null);

		return JSON.stringify(this.result);
	},

	fetchConfigsFromUXC: function(documentTable, documentId) {
		return new sn_uxc_gen_ai.TaskSummarize().fetchConfigs(documentTable, documentId);
	},

	summarizeFromUXC: function(documentTable, documentId, tableConfigs, caller, requestDetails) {
		return new sn_uxc_gen_ai.TaskSummarize().summarize(documentTable, documentId, tableConfigs, caller, requestDetails);
	},

	formatResponseFromUXC: function(documentTable, documentId, request, responseText) {
		return new sn_uxc_gen_ai.TaskSummarize().formatResponse(documentTable, documentId, {'requestPayload': request, 'response': responseText});
	},

	getSummaryFromUXC: function(documentTable, documentId, caller) {
		return new sn_uxc_gen_ai.TaskSummarize().getSummary(documentTable, documentId, caller);
	},

	getRequestPayloadFromUXC: function(inputTable, inputSysId, tablesConfigs, inputCaller, request, requestDetails) {
		return new sn_uxc_gen_ai.TaskSummarize()._getRequestPayload(inputTable, inputSysId, tablesConfigs, inputCaller, request, requestDetails);
	},

	verifySyncResponse: function(response) {
		if (response == null) {
            result["status"] = "error";
            result["error_message"] = "Invalid result from summary script";
            return;
        }

		var capability = response["response"];
		if (capability == null) { //error path
			var message = response["message"];

			if (message == null) {
				gs.warn("No message found in empty capability response");
				message = gs.getMessage("[Empty]");
			}

			this.result["capabilities"] = {};
			this.result["status"] = "error";
			this.result["error_message"] = message;

		} else {                    //happy path
			capability["response"] = this.formatResponse(response["message"]);
			this.result["capabilities"] = {};
			this.result["capabilities"][this.CAPABILITY_ID] = capability;
			this.result["status"] = "completed";
		}
	},

	verifyAsyncConfirmation: function(response, requestPayload, pollId) {
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
				gr.setValue("request_payload", requestPayload);
				gr.setValue("one_extend_capability", this.CAPABILITY_ID);
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
				this.result["capabilities"][this.CAPABILITY_ID] = {};
				this.result["capabilities"][this.CAPABILITY_ID]["PollData"] = pollData;
				this.result["capabilities"][this.CAPABILITY_ID]["status"] = "pending";
				this.result["capabilities"]["message"] = this.result["message"];
			} else { //invalid poll id
				gs.warn("Error: No async request record found");
			}
		} else { //OneExtend error
			gs.warn("Error: Could not initiate async OneExtend Request");
		}
	},

	formatResponse: function(message) {
		if (message === null) {
			gs.warn("Empty response from TaskSummarize");
			return null;
		}
		var formattedResponse = "";

		formattedResponse = GlideStringUtil.escapeHTML(message.replaceAll('<li>', '\n').replaceAll('<p>', '\n').replace(/(?!^)<b>/g,'\n\n').replace(/(<style>((.|\n)*)<\/style>)/, '').replace(/<\/?span[^>]*>/, '\n').replace(/(<([^>]+)>)/ig,  '').trim());
		return formattedResponse;
    },
    type: 'MobileSummarize'
};
