(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
		var flow = request.body.data;
		if (flow) {
			var errors = [];
			var data;
			try {
				data =  FlowDiagramBuilderApi.getFlowDiagramConfiguration(flow, errors);
			} catch (e) {
				errors.push(e);
			}
			return {
				data: data,
				flow: flow,
				errors: errors
			};
		} else {
			return {
				data: request.body.data
			};
		}
	})(request, response);
