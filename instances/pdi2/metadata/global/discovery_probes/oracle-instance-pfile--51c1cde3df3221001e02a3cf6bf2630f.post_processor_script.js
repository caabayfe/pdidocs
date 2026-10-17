new ProbePostProcessor({
	/**
 	* Runs the probe instance
 	*/
	process : function() {
		if (JSUtil.notNil(output))
			current.pfile = output.trim();
	},
	type: "ProbePostProcessor"
});
