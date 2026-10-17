new ProbePostProcessor({
	
	process : function() {
		if (JSUtil.nil(output))
			return;
		
		current.postgres_conf = output;
	},
	
	type: "ProbePostProcessor"
});
