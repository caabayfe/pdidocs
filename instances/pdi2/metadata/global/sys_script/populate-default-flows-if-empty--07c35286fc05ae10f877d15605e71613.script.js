(function executeRule(current, previous /*null when async*/) {
	var DEFAULT_PUBLISH_FLOW = "2222030614f75210f8779da9137d35b3";
	var DEFAULT_RETIRE_FLOW = "ea32fac859c02210f877a8ba01addda2";
	// Add your code here
  if (gs.nil(current.kb_publish_flow)) {
    current.kb_publish_flow = DEFAULT_PUBLISH_FLOW;
  }
  if (gs.nil(current.kb_retire_flow)) {
    current.kb_retire_flow = DEFAULT_RETIRE_FLOW;
  }

})(current, previous);
