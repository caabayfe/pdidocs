(function process( /*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {
	
	var authenticator = new sn_docker_spoke.DockerWebhookAuthenticator(request.queryParams);
    var authResponse = authenticator.authenticate();
    if (authResponse.status == "failure") {
        response.setStatus(authResponse.status);
        response.setBody(authResponse);
        return;
    }
    gs.info("Docker Webhook is triggered.");
    gs.info("Docker Webhook response = " + JSON.stringify(request.body.data));
    var requestBody = request.body.data;

    var inputs = new Object();
    inputs['u_image'] = requestBody.repository.repo_name;
	gs.info("Image = " + requestBody.repository.repo_name);
    var decisionTable = new sn_dt.DecisionTableAPI();

    var sysD = new GlideRecord("sys_decision");
    sysD.get('name', 'Docker Webhook Decision Policy');
	gs.info("sysD = " + JSON.stringify(sysD));
    var decisions = decisionTable.getDecision(sysD.getValue("sys_id"), inputs);
	
    gs.info("Decisions = " + JSON.stringify(decisions));
	
    if (!decisions)
        gs.info("Decision record was not matched.");
    else {
        var subFlowInternalName = new DockerWebhookUtils().getDecisionsubFlow(decisions);
        gs.info("Matched Subflow Internal Name = " + subFlowInternalName);

        var subFlowInputs = {};
        subFlowInputs['payload'] = JSON.stringify(requestBody);
        subFlowInputs['image'] = requestBody.repository.repo_name;

        new DockerWebhookUtils().subflowExecutionEvent(subFlowInputs, subFlowInternalName);
    }

})(request, response);
