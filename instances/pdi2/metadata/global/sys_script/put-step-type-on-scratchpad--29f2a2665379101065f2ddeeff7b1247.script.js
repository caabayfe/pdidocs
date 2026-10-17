(function executeRule(current, previous /*null when async*/) {

	var step = current.guidance_step.getRefRecord();
	
	if(step)
		g_scratchpad.step_type = step.layout;

})(current, previous);
