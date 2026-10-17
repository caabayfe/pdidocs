(function executeRule(current, previous /*null when async*/) {
	if (SNC.MidClusterManagementScriptableApi.doesClusterHaveMultipleLeaders(current.sys_id.toString())) {
		// Create a sys trigger to check if the cluster is in a split brain state, that will run 5 minutes 30 seconds later
		var gr = new GlideRecord("sys_trigger");
		gr.initialize();
		gr.name = "DistributedClusterLeaderCheck";
		
		var gdt = new GlideDateTime();
		gdt.addSeconds(330); // Wait 5 minutes 30 seconds to ensure that we have elapsed one heartbeat time
		
		gr.next_action = gdt;
		gr.script = "SNC.MidClusterManagementScriptableApi.shutDownClusterIfInSplitBrainStatus(\"" + current.sys_id.toString() + "\");";
		gr.trigger_type=0;
		
		gr.insert();
		
		gs.log("Creating sys_trigger to check if distributed cluster is in split brain state.");
	}
})(current, previous);
