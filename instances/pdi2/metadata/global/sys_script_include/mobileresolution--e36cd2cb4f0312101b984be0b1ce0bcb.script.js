var MobileResolution = Class.create();
MobileResolution.prototype = {
	CAPABILITY_ID: "c5870faa20e22110f877d3d1bc36dd87",
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
		
		var inputs = {
			capability_id: this.CAPABILITY_ID,
			table: documentTable,
			record_sys_id: documentId,
			caller: 'MOBILE',
		};

		if (mode == "async")
			inputs["callbackHandler"] = "MobileAsyncCallbackHandler";

		var syncResponse = JSON.parse(new sn_uxc_gen_ai.RecordResolutionGenAIUtils().generateResolution(inputs));

		if (mode == "async") {
			this.verifyAsyncConfirmation(syncResponse, inputs, pollId);
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
				this.verifySyncResponse(response);
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

	verifySyncResponse: function(response) {
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

		} else {                    //happy path
			capability["response"] = JSON.parse(capability["response"])["close_notes"]; 
			this.result["capabilities"] = {};
			this.result["capabilities"][this.CAPABILITY_ID] = capability;
			this.result["status"] = "completed";
		}
	},

	verifyAsyncConfirmation: function(response, inputs, pollId) {
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
	
    type: 'MobileResolution'
};
