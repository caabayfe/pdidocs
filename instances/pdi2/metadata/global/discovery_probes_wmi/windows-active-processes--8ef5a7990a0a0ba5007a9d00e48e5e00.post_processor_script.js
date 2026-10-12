new ProbePostProcessor({

    procs: [],
    proclist: [],
    pidToProc: {},
    pidToCreationDate: {},
    ppidReplacement: {},
    procsInCycle: {},

    /**
     * Runs the probe instance
     */
    process: function() {
        this.proclist = g_array_util.ensureArray(output.Win32_Process);

        for (var i = 0; i < this.proclist.length; i++) {
            var wp = this.proclist[i];

            var procDef = {};
            procDef.pid = wp.ProcessId;
            procDef.ppid = wp.ParentProcessId;
            procDef.name = wp.Name;
            procDef.parameters = JSUtil.notNil(wp.CommandLine) ? ('' + wp.CommandLine).trim() : '';
            procDef.command = JSUtil.nil(wp.ExecutablePath) ? wp.Name : ('' + wp.ExecutablePath).trim();

            if (wp.Name == "System Idle Process")
                procDef.ppid = "99999" + wp.ParentProcessId;

            this.procs.push(procDef);
            this.pidToProc[procDef.pid] = procDef;
            this.pidToCreationDate[procDef.pid] = '' + wp.CreationDate;
        }

        this.findCycles();
        this.replacePPIDs();

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
                    this.procs = filtering.filterResults(this.procs, filterDefs);
                } catch (e) {
                    // Doing this in the catch() makes it seem like this is fallback code when it's really
                    // the preferred code path. Unfortunately we don't have a good way to know if someone
                    // has activated the JavaScript (the real fallback) unless we try to use it.
                    var evaluator = Packages.com.snc.discovery.runningprocess.api.RunningProcessFilterEvaluatorJSProvider.get();
                    this.procs = JSON.parse(evaluator.filter(rpf, this.procs));
                }
            }
            // Filter sensitive data from processes
            var redactorUtils = new SensitiveDataRedactorUtils(g_probe);
            redactorUtils.redactObject(this.procs);

        } catch (e) {
            if (typeof ms != 'undefined')
                ms.log("Windows - Active Processes: Something went wrong while trying to filter processes. Error=" + e);
            else
                // If we don't have access to ms, we are not on the MID
                // Which means we are in classic mode:
                DiscoveryLogger.warn("Unix - Active Processes: Process filtering skipped. Classic mode is not supported.");
        }
        /*
        	Current is a global variable which is expected to hold a stringify JSON.
        	It works for a subprobe while g_probe.setPostProcessOutput() did not work.
        	The result of the probe would look like
        	<result>
        		<output>{"current": <current value> }
        		</output>
        	</result>
        */
        current = this.procs;
    },

    /*
     * Detect the processes that have PPID that eventually point themselves in a cycle.
     * According to MDSN (http://msdn.microsoft.com/en-us/library/aa394372(v=vs.85).aspx),
     * MS OS would reuse a PID that was previously a process that's a parent of others.
     * This results in an issue that we end up getting processes in a circle, but the reality is that
     * there is actually a root.
     */
    findCycles: function() {
        for (var i = 0; i < this.procs.length; i++) {
            var proc = this.procs[i];
            if (this.procsInCycle[proc.pid])
                continue;

            this.detectCycle(proc, []);
        }
    },

    /*
     * Once we know all the PPIDs that was re-used for a new process, we replace all the PPIDs
     * that is still pointing to the old PID by prefixing them with "99999" in order to distinguish it from
     * the new process. We do it here because it's possible that some other processes (not in the cycle)
     * also has the old PPID.
     */
    replacePPIDs: function() {
        for (var i = 0; i < this.procs.length; i++) {
            var proc = this.procs[i];
            if (this.ppidReplacement[proc.ppid])
                proc.ppid = "99999" + proc.ppid;
        }
    },

    detectCycle: function(proc, visited) {
        var cycleStart = -1;
        for (var i = 0; i < visited.length; i++) {
            if (visited[i] == proc.pid) {
                cycleStart = i;
                break;
            }
        }

        if (cycleStart > -1) { // We have a cycle.
            var smallestCD = this.pidToCreationDate[proc.pid];
            var eldestPid = proc.pid;

            for (var i = cycleStart; i < visited.length; i++) {
                var pid = visited[i];
                this.procsInCycle[pid] = true; // Remember the ones we've already found in a cycle
                var cd = this.pidToCreationDate[pid];
                if (cd < smallestCD) {
                    smallestCD = cd;
                    eldestPid = pid;
                }
            }

            // Mark the PPIDs that we need repalce
            var a_proc = this.pidToProc[eldestPid];
            this.ppidReplacement[a_proc.ppid] = true;
            return;
        }

        var parent = this.pidToProc[proc.ppid];
        if (parent) {
            // If the parent is a process tht was previously detected to be in a cycle,
            // we can be rest assured there's no way it's going to be in a cycle with current child process.
            if (this.procsInCycle[proc.pid])
                return;

            visited.push(proc.pid);
            this.detectCycle(parent, visited);
        }
    },

    type: "ProbePostProcessor"
});
