(function executeRule(current, previous /*null when async*/) {
	gs.info('Moving stored visualization to stored component');
	current.stored_component = current.visualization;
	current.visualization = undefined;
	gs.info('Stored component set to ' + current.stored_component);
	// Add your code here
})(current, previous);
