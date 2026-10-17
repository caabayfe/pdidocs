new ProbePostProcessor({

    /**
     * Runs the probe instance
     */    
	process : function() {    
		// parse the results from our lsof output, leaving the result in result.current.connections...
		if (JSUtil.nil(output))
			return;
		var sliceIndex = output.indexOf('\n');
		if (sliceIndex === -1) {
			g_probe.setError('Unexpected output: ' + output);
			return;
		}
		var commandOutput = output.slice(sliceIndex + 1);
		if (output.startsWith('lsof output'))
			this.processOutput(LSOFParser,commandOutput);
		else if (output.startsWith('netstat output')) {
			commandOutput = this.normalizeNetstat(commandOutput);
			this.processOutput(DiscoveryNetstatParser,commandOutput);
		}
		else
			g_probe.setError('Both netstat and lsof commands failed to get connection information');	
    },
	
	//netstat output gives IPs in the form of ip.port converting it to ip:port
	//eg: 10.196.33.215.22  ->  10.196.33.215:22 
	normalizeNetstat : function(output) {
		var outputArray = output.split("\n");
		for(var i=0; i<outputArray.length; i++) {
			var outputParts = outputArray[i].split(/\s+/);
			outputParts[3] = outputParts[3].replace(/(.*)\.(.*)/, '$1:$2');
			outputParts[4] = outputParts[4].replace(/(.*)\.(.*)/, '$1:$2');
			outputArray[i] = outputParts.join(" ");
		}
		return outputArray.join("\n");
	},
	
	processOutput : function(parser, output) {
		var np = new parser();
		np.parse(output);
		related_data.connections = np.tcp;
		related_data.isValid = np.isValid;
		related_data.error_string = np.errorString;
	},
   
	type: "ProbePostProcessor"
});
