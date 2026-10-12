new ProbePostProcessor({

    /**
     * Runs the probe instance
     */
    process: function() {
        // parse the results from our ps output, leaving the result in sensor.running_processes...
        var psop = new PsOutputParser();
        var procs = psop.parse(output);
        try {
            var rpf = this.getParameter("running_process_filter");
            if (rpf) {
                try {
                    var filtering = new RunningProcessesFilter();
                    var filterDefs = JSON.parse(rpf);
                    procs = filtering.filterResults(procs, filterDefs);
                } catch (e) {
                    var evaluator = Packages.com.snc.discovery.runningprocess.api.RunningProcessFilterEvaluatorJSProvider.get();
                    procs = JSON.parse(evaluator.filter(rpf, procs));
                }
            }
            // Filter sensitive data from processes
            var redactorUtils = new SensitiveDataRedactorUtils(g_probe);
            redactorUtils.redactObject(procs);

        } catch (e) {
            if (typeof ms != 'undefined')
                ms.log("Solaris - Active Processes: Something went wrong while trying to filter processes. Error=" + e);
            else
                // If we don't have access to ms, we are not on the MID
                // Which means we are in classic mode:
                DiscoveryLogger.warn("Solaris - Active Processes: Process filtering skipped. Classic mode is not supported.");
        }

        related_data.running_processes = procs;
        related_data.error_msg = psop.error_msg;
    },

    type: "ProbePostProcessor"
});
