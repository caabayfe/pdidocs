(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	var payload = request.body.data;
	var oldDiagram = payload.diagram;
	var newDiagram = "";
	var diagDiff = "";
	var flow;
	
	try {
		flow = JSON.parse(payload.flow);
		newDiagram = FlowDiagramBuilderApi.getDiagramJSON(flow);
		diagDiff = FlowDiagramBuilderApi.getDiagramDifference(newDiagram, JSON.parse(oldDiagram));

	} catch (e) {
		var error = new sn_ws_err.ServiceError();
		error.setMessage("Failed to calculate diagram difference");
		error.setDetail(e.message);
		return error;
	}
	
	return {
		diff: diagDiff
	};
	
})(request, response);
