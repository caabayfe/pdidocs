new ProbePostProcessor({

	/**
     * Runs the probe instance
     */

    /**
	 * Override run method to create custom JSON tags
	 */
	 run : function() {
		// Define global objects for use by subclass
		collector_info = {};
		related_data = {};
		error_map = {};
		this.logs = [];

		// Class appropriate subclass postProcess
    	this.process();

		var result = {};

		// If we have any logs, add it to the output
		if (this.logs.length > 0) {
			result.logs = this.logs;
		}

		// If empty, do not set current
		if (!JSUtil.isEmpty(collector_info))
			result.collector_info = collector_info;

		// If empty, do not set related_data
		if (!JSUtil.isEmpty(related_data))
			result.related_data = related_data;

		if (!JSUtil.isEmpty(error_map))
			result.errorMap = error_map;

    	// Compare results with cache and send back json response
    	g_probe.setPostProcessOutput(new JSON().encodeObject(result));
	 },

	process : function() {
		if (JSUtil.nil(output))
			return;
		//Output payload is separated by special signature and payload is in the order of
		//1. Collector info
		//2. logs
		//3. Error Map
		//4. PS payload
		//5. Connection payload
		var split_output = output.split("====ADME_PAYLOAD_SEPARATOR====");

		//if no ps and connection payload, we will have only collector info and logs
		if (split_output.length != 3 && split_output.length != 5) {
			this.logs.push("Output payload array length is not expected. Expecting 3 or 5, found " + split_output.length);
			return;
		}
		var collector_info_array = split_output[0].split("\n");
 		collector_info.workspace = collector_info_array[0];
 		collector_info.pid = collector_info_array[1];
 		collector_info.first_time = collector_info_array[2];
		this.logs.push(split_output[1]);
		error_map = split_output[2];

		if (split_output.length == 5) {
			related_data.processes = this.parsePsOutput(split_output[3]);
			related_data.connections = this.parseConnectionOutput(split_output[4]);
		}

	},

	parsePsOutput: function(output) {
		var psop = new PsOutputParser();
		var rps = psop.parse(output);

		try {
			var rpf = this.getParameter("running_process_filter");
			if (rpf) {
				// There's both a Java and JavaScript implementation of process filtering. The Java
				// version is significantly faster so it's preferred and is what's used OOB.
				// The JavaScript version is shipped in case there's a bug in the Java version. If
				// there is a bug in the Java version then chances are good the JavaScript version
				// has the same bug, but the difference is that the JavaScript version can be fixed
				// and tested on a customer instance, providing immediate relief.
				// Switch to the JavaScript version by simply activating the MID script include
				// record named "RunningProcessesFilter".
				// IMPORTANT: Any fixes in this script need to be replicated in the Java code in
				// the RunningProcessFilterEvaluatorModule.
				try {
					var filtering = new RunningProcessesFilter();
					var filterDefs = JSON.parse(rpf);
					rps = filtering.filterResults(rps, filterDefs);
				} catch (e) {
					// Doing this in the catch() makes it seem like this is fallback code when it's really
					// the preferred code path. Unfortunately we don't have a good way to know if someone
					// has activated the JavaScript (the real fallback) unless we try to use it.
					var evaluator = Packages.com.snc.discovery.runningprocess.api.RunningProcessFilterEvaluatorJSProvider.get();
					rps = JSON.parse(evaluator.filter(rpf, rps));
				}
			}


		} catch (e) {
			if (typeof ms != 'undefined')
				ms.log("Unix - ADM Enhanced: Something went wrong while trying to filter processes. Error=" + e);
			else
				// If we don't have access to ms, we are not on the MID
				// Which means we are in classic mode:
				DiscoveryLogger.warn("Unix - ADM Enhanced Processes: Process filtering skipped. Classic mode is not supported.");
		}

		if( psop.error_msg !== null )
			related_data.error_msg += psop.error_msg;

		if (this.getParameter('filter_kernel_procs') == 'true')
			psop.filterKernelProcs(rps);

		psop.filterAdmeProcs(rps,collector_info.pid);

		// Filter sensitive data from processes
		var redactorUtils = new SensitiveDataRedactorUtils(g_probe);
		redactorUtils.redactObject(rps);

        return rps;
	},

	parseConnectionOutput: function(output) {
		var cols = [
	            { header_matcher:/^COUNT$/,     prop_name:'count',     last:false },
	            { header_matcher:/^TYPE$/,    prop_name:'type',    last:false },
	            { header_matcher:/^PID$/,    prop_name:'pid',    last:false },
	            { header_matcher:/^IP$/,    prop_name:'ip',    last:false },
	            { header_matcher:/^PORT$/,    prop_name:'port',    last:false },
	            { header_matcher:/^LOCAL_IP$/,    prop_name:'local_ip',    last:false },
	            { header_matcher:/^LOCAL_PORT$/, prop_name:'local_port', last:true  }
	        ];
	        var ttp = new TabularTextParser();
	        var connections = ttp.parse(output, cols);
			if( ttp.error_msg !== null )
				related_data.error_msg += ttp.error_msg;
	        return connections;
	},

    type: "ProbePostProcessor"
});
