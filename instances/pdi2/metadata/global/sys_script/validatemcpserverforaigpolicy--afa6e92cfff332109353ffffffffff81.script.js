(function executeRule(current, previous /*null when async*/) {
	var ga = new GlideRecord('auth_server_connection');
	ga.addQuery('resource', current.mcp_server.toString());
	ga.setLimit(1);
	ga.query();
	if (!ga.next()) {
		current.setAbortAction(true);
		gs.addErrorMessage(gs.getMessage('Invalid MCP Server: no auth_server_connection record found with resource = {0}', current.mcp_server.toString()));
	}
})(current, previous);
