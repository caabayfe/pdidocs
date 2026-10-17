(function executeRule(current, previous) {

	gs.info("Node type was changed from " + previous.node_type.name + " to " + 
	current.node_type.name + " by user '" + gs.getUserName() + "'");

})(current, previous);
