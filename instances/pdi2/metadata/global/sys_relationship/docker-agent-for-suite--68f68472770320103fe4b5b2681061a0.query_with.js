(function refineQuery(current, parent) {

	current.addQuery("agent", parent.agent_id);
	current.addNotNullQuery("agent");
	
})(current, parent);
