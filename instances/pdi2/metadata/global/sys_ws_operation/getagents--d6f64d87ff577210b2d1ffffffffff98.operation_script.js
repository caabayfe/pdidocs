(function process(/*RESTAPIRequest*/ request, /*RESTAPIResponse*/ response) {

    var scopeMap = {};   // Used to group agents by scope_id

    var agentConfig = new GlideRecord("sn_aia_agent_config");
    if (!agentConfig.isValid()) {
		response.setBody({
			"error" : "The AI Agent Config table does not exist"
		});

		return;
	}
	
	agentConfig.addQuery("active", true);
	agentConfig.orderBy("sys_scope.name");   // Keeps scopes nicely sorted
	agentConfig.query();

	while (agentConfig.next()) {
		var scopeId   = agentConfig.getValue("sys_scope") || "no_scope";
		var scopeName = agentConfig.sys_scope.name + "" || "No Scope Name";
		var scopeLogo = agentConfig.sys_scope.logo + "" || "";

		// Create scope entry if it doesn't exist yet
		if (!scopeMap[scopeId]) {
			scopeMap[scopeId] = {
				scope_id:   scopeId,
				scope_name: scopeName,
				scope_logo: scopeLogo,
				agents:     []          // ← agents array starts here
			};
		}

		// Add this agent to the scope's agents array
		scopeMap[scopeId].agents.push({
			label:       agentConfig.agent.name + "" || "No name",
			id:          agentConfig.getValue("agent"),
			description: agentConfig.agent.description + ""
		});
	}
    

    // Convert the map into a clean array
    var data = [];
    for (var key in scopeMap) {
        data.push(scopeMap[key]);
    }

    // === SEND RESPONSE ===
    response.setStatus(200);
    response.setBody({
        "data": data
    });

})(request, response);
