new ProbePostProcessor({

    /**
     * Runs the probe instance
     */
    process : function() {  
        related_data.isAzure = output && output.toLowerCase() == "true";
	}
});
