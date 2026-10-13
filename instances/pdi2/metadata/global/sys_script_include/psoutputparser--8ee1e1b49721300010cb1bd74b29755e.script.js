// Discovery

var PsOutputParser = Class.create();
PsOutputParser.prototype = {
    initialize: function() {
    },
    
    /**
     * Parses the given output from running ps (with at least the PID, PPID, and COMMAND columns), 
     * returning an array of running process objects with the following properties:
     *   pid:        the PID of the process
     *   ppid:       the PPID of the process
     *   name:       the name of the command (sans path)
     *   command:    the complete command (with path), but without the command's parameters
     *   parameters: the command's parameters (if any)
     *
     * Note: this method assumes that parameters always start with a ' -' string.
     */
    parse: function(output) {
        // parse the results from our ps output...
        var cols = [
            { header_matcher:/^PID$/,     prop_name:'pid',     last:false }, 
            { header_matcher:/^PPID$/,    prop_name:'ppid',    last:false }, 
            { header_matcher:/^C.*M.*D$/, prop_name:'command', last:true  }
        ];
        var ttp = new TabularTextParser();
        var rps = ttp.parse(output, cols);
        this.error_msg = ttp.error_msg;  // preserve any error messages we got from the parser...
        
        // now iterate over our found objects to split the command into name, command, and parameters...
        for (var i = 0; i < rps.length; i++) {
            var rp = rps[i];
            
			// First check and see if we have a valid numerical value for pid and ppid
			if (isNaN(rp.pid) || isNaN(rp.ppid)) {
				rps.splice(i,1);
				i--;
				continue;
			}

            // find the start of the parameters, if there are any
            // this is more challenging than it might appear, as all of the following are possible:
            //    /usr/bin/xxx -a
            //                 ^- parameters start
            //    /usr/bin/xxx /usr/bin/yyy -a
            //                 ^- parameters start
            //    /usr/bin abc/xxx -a
            //                     ^- parameters start
            //    /usr/bin/xxx yyy -a
            //                     ^- parameters start
            //    /usr/bin/xxx yyy ccc -a
            //                     ^- parameters start	
            var parts = rp.command.split(' ');
            var j;
            for (j = 1; j < parts.length; j++) {
                var c = parts[j].charAt(0);
                
                // if this part starts with something we can tell is a parameter, run with it...
                if ((c == '-') || (c == '/'))
                    break;
            }
            rp.command = parts.slice(0, j).join(' ');
            rp.parameters = parts.slice(j, parts.length).join(' ');
            
			// For POSIX, the original process would typically have PID and PPID
			// equal to 0. We need to fake a real root for later
			if (rp.pid == rp.ppid)
				rp.ppid = "1000000000" + rp.ppid;
			
            // set the name...
            var name_index = rp.command.lastIndexOf('/');
            name_index = (name_index >= 0) ? name_index + 1 : 0;
            rp.name = rp.command.substring(name_index);
			
			//Trim up the whitespace
			if(rp.name)
            	rp.name = rp.name.trim();
            if(rp.command)
            	rp.command = rp.command.trim();
			if(rp.parameters)
				rp.parameters = rp.parameters.trim();
			if(rp.parameters.toLowerCase().includes("password")) {
				rp.parameters = rp.parameters.replace(/password\s*=?\s*\S+/gmi,"******");
			}
        }
        
        return rps;
    },
	
	/**
     * Filters out any kernel processes (processes that are child of the 
	 * kernel thread).  These are not used in process classification.
     */
	filterKernelProcs: function(rps) {
		// find the kernel thread pid, and filter it out
		var kpid = -1;
		for (var i = 0; i < rps.length; i++) {
			if (rps[i].command == '[kthread]' || rps[i].command == '[kthreadd]') {	
				kpid = rps[i].pid;
				rps.splice(i,1);
				break;
			}
		}
		
		if (kpid == -1)
			return;
		
		// filter out any processes with ppid matching that of the kernel thread
		var i = rps.length;
		while (i--)
			if (rps[i].ppid == kpid)
				rps.splice(i,1);
	},

    type: 'PsOutputParser'
};
