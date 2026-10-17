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
                    procs = filtering.filterResults(procs, filterDefs);
                } catch (e) {
                    // Doing this in the catch() makes it seem like this is fallback code when it's really
                    // the preferred code path. Unfortunately we don't have a good way to know if someone
                    // has activated the JavaScript (the real fallback) unless we try to use it.
                    var evaluator = Packages.com.snc.discovery.runningprocess.api.RunningProcessFilterEvaluatorJSProvider.get();
                    procs = JSON.parse(evaluator.filter(rpf, procs));
                }
            }

            var redactorUtils = new SensitiveDataRedactorUtils(g_probe);
            redactorUtils.redactObject(procs);

        } catch (e) {
            if (typeof ms != 'undefined')
                ms.log("Unix - Active Processes: Something went wrong while trying to filter processes. Error=" + e);
            else
                // If we don't have access to ms, we are not on the MID
                // Which means we are in classic mode:
                DiscoveryLogger.warn("Unix - Active Processes: Process filtering skipped. Classic mode is not supported.");
        }

        related_data.running_processes = procs;
        related_data.error_msg = psop.error_msg;

        if (this.getParameter('filter_kernel_procs') == 'true')
            psop.filterKernelProcs(related_data.running_processes);
    },

    type: "ProbePostProcessor"
});
