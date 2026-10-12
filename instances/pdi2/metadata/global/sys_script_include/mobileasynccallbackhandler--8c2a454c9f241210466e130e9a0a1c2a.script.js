var MobileAsyncCallbackHandler = Class.create();
MobileAsyncCallbackHandler.prototype = {
    initialize: function() {
    },

	processCompleted: function(response) {
		var externalKey = response["transactionId"];
		var gr = new GlideRecord("sys_sg_async_service_request");

		gr.addQuery("external_key", externalKey);

		gr.query();
		
		if (gr.next()) {
			var key = Object.keys(response["result"])[0];
			gr.setValue("request_payload", JSON.stringify(response["result"][key]["requestPayload"]));
			gr.setValue("response_payload", JSON.stringify(response));
			gr.setValue("status", "completed");
			gr.update();
		} else {                      //invalid poll id
			gs.warn("Error: No async request record found");
			return;
		}
	},
	
	processErrored: function(response) {
		var externalKey = response["transactionId"];
		var gr = new GlideRecord("sys_sg_async_service_request");

		gr.addQuery("external_key", externalKey);

		gr.query();

		if (gr.next()) {
			gr.setValue("response_payload", JSON.stringify(response));
			gr.setValue("status", "error");
			gr.update();
		} else {                      //invalid poll id
			gs.warn("Error: No async request record found");
			return;
		}
	},
	
	processCancelled: function(response) {
		var externalKey = response["transactionId"];
		var gr = new GlideRecord("sys_sg_async_service_request");

		gr.addQuery("external_key", externalKey);

		gr.query();

		if (gr.next()) {
			gr.setValue("response_payload", JSON.stringify(response));
			gr.setValue("status", "error");
			gr.update();
		} else {                      //invalid poll id
			gs.warn("Error: No async request record found");
			return;
		}
	},

    type: 'MobileAsyncCallbackHandler'
};
