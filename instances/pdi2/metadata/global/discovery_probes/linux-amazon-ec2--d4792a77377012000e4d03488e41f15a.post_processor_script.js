new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
    process : function() {  
        related_data.isEc2 = false;
		var lowerCaseOutput = output.toLowerCase();
		if (lowerCaseOutput == "amazon" || lowerCaseOutput.startsWith("ec2"))
			related_data.isEc2 = true;
	}
});
