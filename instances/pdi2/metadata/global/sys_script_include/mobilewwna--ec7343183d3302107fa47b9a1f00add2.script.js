const TABLE = 'sys_sg_async_service_request';

var MobileWWNA = Class.create();
MobileWWNA.prototype = {
	initialize: function() {},

	startGenAIRequest(externalKey, requestPayload, skillId) {
		const gr = new GlideRecord(TABLE);
		gr.initialize();
		gr.external_key = externalKey;
		gr.status = 'processing';
		gr.request_payload = JSON.stringify(requestPayload);
		gr.one_extend_capability = skillId;
		gr.insert();
		
		return gr.getValue('poll_id');
	},

	getGenAIResponse: function({pollId, externalKey}) {
		const gr = new GlideRecord(TABLE);
		gr.addQuery('sys_created_by', gs.getUserName());

		if(pollId) {
			gr.addQuery('poll_id', pollId);
		}

		if(externalKey) {
			gr.addQuery('external_key', externalKey);
		}
		gr.query();

		return gr;
	},

    setGenAIResponse: function(externalKey, response) {
		for (let featureKey in response.features) {
			const feature = response.features[featureKey];
			const gr = this.getGenAIResponse({externalKey: externalKey});
			if(gr.next()) {
				const result = feature.result;
				try {
					var response_text = JSON.parse(result.response).response;
				} catch (err) {
					response_text = result.response;
				}
				
				gr.setValue('response_payload', JSON.stringify({Message: response_text, LogId: result.logId}));
				gr.setValue('status', 'success');
				gr.update();
			}
			break;
		}
    },

	type: 'MobileWWNA'
};
