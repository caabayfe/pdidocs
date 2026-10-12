var MIDWrapperConfigOperations = Class.create();
MIDWrapperConfigOperations.prototype = {
    initialize: function() {
		this.failure_message = "failure";
		this.success = "success";
		this.status_tag = "status";
		this.errors_tag = "errors";
		this.result_tag = "result";
    },

	verifyRole: function() {
		// Get the current user's object
		var user = gs.getUser();

		// Check if the user has a specific role
		if (!user.hasRole('agent_admin')) {
			throw new Error("Missing required role based access to proceed with this request.");
		}
	},

	syncWithProfile: function(mid_name_list, strategy, restart_allowed) {
		this.verifyRole();
		let response = {};
		response[this.result_tag] = [];
		if (strategy !== "override_ifexists" && strategy !== "replace_all") {
			response["status"] = this.failure_message;
			response["error"] = "Invalid strategy. Valid strategies are: [\"override_ifexists\" and \"replace_all\"]";
			return response;
		}

		mid_name_list.forEach(name => {
			var probe = new SncProbe();
			probe.topic = "SystemCommand";
			probe.source = 'wrapper_override_operation';
			probe.setEccPriority("0");
			probe.addParameter("action", "sync_with_instance");
			probe.addParameter("sync_strategy", strategy);
			probe.addParameter("restartAllowed", restart_allowed);
			probe.create("mid.server." + name);
		});
	},


	createVerifyWrapperECCRequests: function (mid_sys_id_list, json_result) {
		this.verifyRole();
		var response_list = [];

		if (!mid_sys_id_list || mid_sys_id_list.length == 0)
			return this.prepareResponse(response_list, json_result);

		// there in no need to create requests for mids that are down
		var gr = GlideRecord("ecc_agent");
		gr.addEncodedQuery("sys_idIN"+mid_sys_id_list.join(','));
		gr.query();

		while(gr.next()) {
			var data = {};
			data['sys_id'] = gr.getValue('sys_id');
			data['status'] = gr.getValue('status');
			data['name'] = gr.getValue('name');
			data['request_id'] = undefined;
			data['error'] = undefined;
			response_list.push(data);
			
			// mid found removing it from the request list
			const index = mid_sys_id_list.indexOf(data['sys_id']);
			mid_sys_id_list.splice(index, 1);
		}

		// invalid sys ids needs to be added as error
		mid_sys_id_list.forEach((sys_id) => {
			var data = {};
			data['sys_id'] = sys_id;
			data['status'] = 'Invalid';
			data['name'] = undefined;
			data['request_id'] = undefined;
			data['error'] = "Invalid sys id.";
			response_list.push(data);
		});
		
		response_list.forEach((mid_data) => {
			if (mid_data['status'] !== 'Up')
				return;

			var probe = new SncProbe();
			probe.topic = "SystemCommand";
			probe.source = 'wrapper_override_operation';
			probe.setEccPriority("0");
			probe.addParameter("action", "validate");

			var ecc_request_id = probe.create("mid.server." + mid_data['name']);
			mid_data['request_id'] = ecc_request_id;
		});

		return this.prepareResponse(response_list, json_result);
	},

	getVerificationECCResults: function(ecc_id_list, json_result) {
		var responses = {};
	
		if (!ecc_id_list || ecc_id_list.length == 0)
			return this.prepareResponse(responses, json_result);

		var gr = new GlideRecord("ecc_queue");
		gr.addEncodedQuery('response_toIN'+ecc_id_list.join(','));
		gr.query();

		while (gr.next()) {
			var xmlDoc = new XMLDocument2();
			xmlDoc.parseXML(gr.getValue('payload'));
			var res_data = {}
			if (xmlDoc.getNode("results").hasAttribute("error")) {
				res_data['error'] = xmlDoc.getNode("results").getAttribute("error");
				res_data['response'] = undefined;
				responses[gr.getValue('response_to')] = res_data;
			} else {
				var out = xmlDoc.getNodeText("//output");
				var json_data = JSON.parse(out);
				res_data['response'] = json_data;
				res_data['error'] = undefined;
				responses[gr.getValue('response_to')] = res_data;
			}
		}
		
		return this.prepareResponse(responses, json_result);
	},

	prepareResponse: function(data, json_result) {
		if (json_result)
			return JSON.stringify(data);
		return data;
	},

	performWrapperVerification: function(mid_sys_id_list, retry_count, json_result) {
		var responses = [];

		var request_data = this.createVerifyWrapperECCRequests(mid_sys_id_list, false);
		
		retry_count = Math.max(1, retry_count);
		retry_count = Math.min(5, retry_count);
		var pending_map = {};
		request_data.forEach((data) => {
			if(!data['request_id']) {
				responses.push(data);
			} else {
				ecc_request_ids.push(data['request_id']);
				pending_map[data['request_id']] = data;
			}
		});


		var ecc_request_ids = [];
		for (var i = 0; i < retry_count; i++) {

			if (ecc_request_ids.length == 0)
				break;

			if (retry_count > 0)
				gs.sleep(1000);

			var ecc_response = this.getVerificationECCResults(ecc_request_ids, false);

			ecc_response.forEach((value, key) => {
				var index = ecc_request_ids.indexOf(key);
				ecc_request_ids.splice(index, 1);

				var obj = pending_map[key];
				obj['error'] = value['error'];
				obj['response'] = value['response'];
				responses.push(obj);
			});
		}

		ecc_request_ids.forEach((id) => {
			var obj = pending_map[id];
			obj['error'] = "No response from MID.";
			obj['response'] = undefined;
			responses.push(obj);
		});

		return this.prepareResponse(responses, json_result);
	},

    type: 'MIDWrapperConfigOperations'
};
