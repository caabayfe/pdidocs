ms.include("PostProcessorIncludes");

var ProbePostProcessor = Class.create();
ProbePostProcessor.prototype = {

    initialize : function(definition) {

		// Init logs array
		this.logs = [];

		// Allow to override methods from constructor
		for (var property in definition)
            this[property] = definition[property];

		// Lets run
		this.run();
	},

    /**
     * Runs the probe instance
     */
    run : function() {
		// Define global objects for use by subclass
		current = {};
		related_data = {};
		postProcessedOutput = {};

		// If WMIRunner probe, convert the xml output to json before processing
		if (this.getParameter('topic') == 'WMIRunner' && (this.getParameter('output_format') == 'xml' || !this.getParameter('output_format'))) {
			var xmlHelper = new XMLHelper();
			var xmlResult = xmlHelper.toObject(output);
			if (!xmlResult) {
            			var xmlResult = xmlHelper.toObject(output.replace(
    				/<CommandLine>([\s\S]*?)<\/CommandLine>/gi,
    				(_, cmd) => {
      				var cleaned_output = cmd;
      				cleaned_output = cleaned_output.replace(/&/g, '&amp;')
                       			.replace(/</g, '&lt;')
                       			.replace(/>/g, '&gt;')
					.replace(/"/g, '&quot;')
					.replace(/'/g, '&apos;')
      				return `<CommandLine>${cleaned_output}</CommandLine>`;
    				}
  				));
			}
			if (!JSUtil.nil(xmlResult))
				output = xmlResult;
		}

		// Class appropriate subclass postProcess
    	this.process();

		var result = {};
		// If we have any logs, add it to the output
		if (this.logs.length > 0) {
			result.logs = this.logs;
		}

		// If empty, do not set current
		if (!JSUtil.isEmpty(current))
			result.current = current;

		// If empty, do not set related_data
		if (!JSUtil.isEmpty(related_data))
			result.related_data = related_data;

		// If empty, do not set output
		if (!JSUtil.isEmpty(postProcessedOutput))
			result = postProcessedOutput;

    	// Compare results with cache and send back json response
		g_probe.setPostProcessOutput(new JSON().encodeObject(result));
    },

    /**
	 * Override this method to do the post processing
	 */
	process : function() {
	},

	/**
	 * Get parameter from the probe payload
	 */
    getParameter : function(param) {
        if (g_probe != null)
            return g_probe.getParameter(param);
        else
            return null;
    },

	log : function(str) {
		ms.log("PostProbeProcessor: " + str);
		this.logs.push(str);
	},

    type: "ProbePostProcessor"
}
