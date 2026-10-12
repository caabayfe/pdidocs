(function executeRule(current, previous /*null when async*/) {

	//Condition : Exclude Default Chat Setup insertion. This already comes with Context Variables OOB.
	//Copy all Context Variables for the New Chat Setup page being inserted.
	
	var gr = new GlideRecord("sys_cs_virtual_agent_context");
	gr.addQuery("live_agent_setup", "f0acbc4c5f091300e6333654de7313c8");
	gr.query();
	
	while (gr.next()) {
		gr.setValue("live_agent_setup", current.getUniqueValue());
		gr.insert();
	}
	
})(current, previous);
