// Discovery

var EnrichProcessesAndConnections = Class.create();
EnrichProcessesAndConnections.prototype = {

	initialize: function(sensor) {
		// a little initialization from our sensor...
		this.sensor = sensor;
		this.rps = sensor.running_processes;
		this.conns = sensor.connections;

		// map of process info maps by PID...
		this.byPID;

		// list of process tree roots...
		this.processTreeRoots;

		// localIPs - This should only be used for tcp connection manipulation and nothing else. 
		this.localIPs = {};

		// set the localIPs
		this._setLocalIPs();

		// map of process names that are always considered super-servers.
		this.super_servers = {};
		var sss = gs.getProperty('glide.discovery.super_servers', 'inetd,xinetd,launchd').split(',');
		for (var i = 0; i < sss.length; i++)
			this.super_servers[sss[i]] = true;

		// map of service ports to names, for services defined in cmdb_ip_service...
		// PRB1292267 removes local usage of this variable, keeping for compatibility if needed
		this.service_names = this.get_services();

		// map of super servers by port...
		this.byPortAndIp = {};
	},

	/**
     * Enriches the running processes and connections (in sensor.running_processes and sensor.connections, respectively)
     * with information about each other.  Both of these inputs are arrays of information maps whose properties exactly
     * reflect the underlying records in cmdb_running_process and cmdb_tcp.  The results of the enrichment are
     * modifications to those same records.
     */
	process: function() {

		this.indexPIDs();
		this.buildProcessTree();

		this.mapConnectionsByProcess();
		this.rollupForked();
		this.rollupProxied();
		this.fixConnectionField('pid');
		this.generateRPs();
		this.runHandlers(this.rps);

		// fix up the values in the sensor...
		this.sensor.running_processes = this.rps;
		this.sensor.connections = this.conns;
	},

	/**
	 * Reconciles the running processes.
	 */
	reconcile: function() {
		// rebuild the process tree roots
		this.rps = this.sensor.running_processes;
		this.indexPIDs();
		this.buildProcessTree();

		// get rid of any nonsense connections...
		this.noNonsense();

		// flip any "to" connections to "on" connections that need to be flipped
		this._flipAllConnections();

		// Remove connections if process or any parent process has the same listening port as the process
		// The order is important that this follows _flipAllConnections
		this._removeConnections();

		// fix up the values in the sensor...
		this.sensor.running_processes = this.rps;
		this.sensor.connections = this.conns;

		this.fixProcessPorts();

		// reconcile the running processes...
		var rpr = new RunningProcessReconciler(this.sensor.getCmdbCi(), this.rps, this.processTreeRoots, this.byPID);
		rpr.reconcile();

		// now that we've got process sys_ids, fix up our connection references...
		this.fixConnectionField('sys_id', 'process');
	},

	/**
     * Eliminate nonsense connections.
     */
	noNonsense: function() {
		var i, conn, my_proc, portListName;

		// for each of our connections...
		for (i = 0; i < this.conns.length; i++) {
			conn = this.conns[i];

			// if we don't have a pid, delete it...
			if (!conn.pid) {
				this.conns.splice(i, 1);
				i--;
				continue;
			}

			// if our process doesn't know about us, delete it (this happens because of rollups)...
			my_proc = this.byPID[conn.pid];

			portListName = '_connecting_to_ports';
			if (conn.type == 'on')
				portListName = '_listening_on_ports';
			if (my_proc && my_proc[portListName] && !my_proc[portListName][conn.port]) {
				this.conns.splice(i, 1);
				i--;
			}
		}
	},

	/**
     * Remove connections if process or any parent process has the same listening port as the process
     */
	_removeConnections: function() {
		var i, conn, my_proc, proc, gr, sys_id;

		// If the connection is from ADME probe, do not filter, since we already done that in the shell scripts.
		if (this.fromADME)
			return;

		// for each of our connections...
		for (i = 0; i < this.conns.length; i++) {
			conn = this.conns[i];
			my_proc = this.byPID[conn.pid];

			// If we could not find a process based on the PID of the connection, then delete the conncetion
			if (!my_proc) {
				this.conns.splice(i, 1);
				i--;
				continue;
			}

			// Remove connection to if the process or any parent process has the same listening port as the process  
			if (conn.type == 'to') {				
				proc = this._listensOnPort(conn.local_port, my_proc);

				if (proc) {
					this.conns.splice(i, 1);
					i--;

					// remove from listening_on from process
					delete proc._listening_on_ports[conn.port];
				}
			}
		}
	},

	/**
     * Flip connections that are "to" connections to "on" if ip is a local ip and there is pid or ppid listening on same port
     */
	_flipAllConnections: function() {
		var _this = this,
			flipped = true;

		// If the connections are from ADME probe, don't flip it.
		if (this.fromADME)
			return;

		// Keep flipping until nothing to flip. This is required for multi level flipping that might be needed.
		while (flipped)
			_flipConnections();

		function _flipConnections() {

			flipped = false;
			for (var i = 0; i < _this.conns.length; i++) {
				var conn = _this.conns[i];
				var my_proc = _this.byPID[conn.pid];

				if (conn.type == 'to' && _this.localIPs[conn.ip]) {
					var proc = _this._listensOnPort(conn.port, my_proc);

					if (proc) {
						// Remove it from connecting to and add to listening_to
						if (proc._connecting_to_ports && proc._connecting_to_ports[conn.port])
							delete proc._connecting_to_ports[conn.port];
						proc._listening_on_ports[conn.port] = 1;

						// flip it
						conn.type = 'on';
						conn.port = conn.local_port;
						conn.ip = conn.local_ip;
						flipped = true;
					}
				}
			}

			return flipped;
		}
	},

	fixConnectionField: function(field, dest) {
		var pid, conn, proc;

		dest = dest || field;

		// for each of our connections...
		for (var i = 0; i < this.conns.length; i++) {
			conn = this.conns[i];

			// add a process reference...
			proc = this.byPID[conn.pid];

			conn.process = null;  // in case we can't resolve it...
			if (proc && proc[field])
				conn[dest] = proc[field];
		}
	},

	fixProcessPorts: function() {
		for (pid in this.byPID) {
			proc = this.byPID[pid];
			proc._listening_on_ports = { };
			proc._connecting_to_ports = { };
		}

		// for each of our connections...
		for (var i = 0; i < this.conns.length; i++) {
			conn = this.conns[i];

			// add a process reference...
			proc = this.byPID[conn.pid];

			if (proc) {
				if (conn.type == 'on')
					proc._listening_on_ports[conn.port] = 1;
				else
					proc._connecting_to_ports[conn.port] = 1;
			}
		}

		for (pid in this.byPID) {
			proc = this.byPID[pid];
			proc.listening_on = this.portList(proc._listening_on_ports);
			proc.connecting_to = this.portList(proc._connecting_to_ports);
		}
	},

	/**
     * Runs the handlers that are enabled for running in the sensor, mainly to set key_parameters.
     */
	runHandlers: function(procs) {
		// get a list of all our handlers, in name order...
		var handlers = [];
		var gr = new GlideRecord('discovery_proc_handler');
		gr.addActiveQuery();
		gr.orderBy('name');
		gr.query();
		while (gr.next()) {
			var handler = {};
			handler.condition = '' + gr.condition;
			handler.classify  = ('true' == '' + gr.classify);
			handler.script    = '' + gr.script;

			//For efficiency, instantiate a "filter" object for checking the handler conditions:
			if(handler.condition)
				handler.filter = new SNC.Filter(handler.condition, "rule-condition");

			handlers.push(handler);
		}

		// Traverse all running processes, and find out the largest count
		var maxCount = 0;
		if (this.checkCountForClassify) {
			// When running process classification from ADME probe, only classify those processes
			// with high count number, since low count processes may already dead
			// TODO: This solution is temporary in K, in future release, should take a process
			// snap shot when retrieving the ADME result, and run process classification for those
			// proceses only.
			var classifyRatio = 0.9;
			for (var p = 0; p < procs.length; p ++) {
				if (parseInt(procs[p].count) > maxCount)
					maxCount = procs[p].count;
			}
		}
		var classifyThreshold = Math.round(maxCount * classifyRatio);

		// for each running process...
		var rp_gr = new GlideRecord('cmdb_running_process');
		for (var p = 0; p < procs.length; p++) {

			// make a fake GlideRecord...
			var proc = procs[p];
			proc.key_parameters = proc.parameters;  // default...
			rp_gr.initialize();
			for (var field in proc)
				rp_gr[field] = proc[field];

			var shouldClassify = this.checkCountForClassify ? parseInt(proc.count) >= classifyThreshold : true;

			// run our handlers against our fake record...
			for (var i = 0; i < handlers.length; i++) {
				var handler = handlers[i];
				if (handler.filter && handler.filter.match(rp_gr, true)) {
					shouldClassify = shouldClassify && handler.classify;
					// update the classify setting...
					rp_gr.setValue('classify', shouldClassify);

					// run the script...
					var old_current = current;
					current = rp_gr;
					eval(handler.script);
					current = old_current;

					// update the appropriate field in our proc record...
					proc.name           = '' + rp_gr.name;
					proc.pid            = '' + rp_gr.pid;
					proc.ppid           = '' + rp_gr.ppid;
					proc.command        = '' + rp_gr.command;
					proc.parameters     = '' + rp_gr.parameters;
					proc.key_parameters = '' + rp_gr.key_parameters;
					proc.listening_on   = '' + rp_gr.listening_on;
					proc.connecting_to  = '' + rp_gr.connecting_to;
				}
			}
			proc.classify = shouldClassify;
		}
	},

	/**
     * Regenerates the list of running processes from the index of PIDs.
     */
	generateRPs: function() {
		// first we pull out all the processes we actually want to keep (those not redirected)...
		var newRPs = [];
		for (var pid in this.byPID) {
			var rp = this.byPID[pid];
			if (pid == rp.pid)
				newRPs.push(rp);
		}

		// then we go through all the keepers and fixup any redirected PPIDs, and add our connections fields...
		for (var i = 0; i < newRPs.length; i++) {
			// set the PPID...
			var rp = newRPs[i];

			// Set the ppid only when the redirected process is not itself.
			if(this.byPID[rp.ppid] && rp.pid != this.byPID[rp.ppid].pid)
				rp.ppid = this.byPID[rp.ppid].pid;

			// generate our connections fields...
			if (rp._listening_on) {
				rp._listening_on_ports = { };
				rp.listening_on = this.portList(rp._listening_on_ports, rp._listening_on);

				delete rp._listening_on;
			}
			if (rp._connecting_to) {
				rp._connecting_to_ports = { };
				rp.connecting_to = this.portList(rp._connecting_to_ports, rp._connecting_to);
				
				delete rp._connecting_to;
			}

			// get rid of any kids...
			if (rp._kids)
				delete rp._kids;
		}

		// finally, we stuff the result, reindex, and rebuild our tree...
		this.rps = newRPs;
		this.indexPIDs();
		this.buildProcessTree();
	},

	portList: function(ports, portAndIps) {
		var name, result;

		if (portAndIps) {
			for (name in portAndIps)
				ports[portAndIps[name].port] = 1;
		}
		result = Object.keys(ports);
		result.sort(function(a,b) { a = a|0; b = b|0; if (a > b) return 1; if (b > a) return -1; return 0; });

		// Make sure we get leading and trailing colons.
		result = result.join(':');
		return result ? ':' + result + ':' : '';
	},

	/**
     * Identifies super-server processes in a depth-last recursive descent.  When a super-server process is detected, a
     * synthetic child process is created for each port that the super-server is listening on.  If there are child processes
     * with connections on one of the listening ports, those processes are rolled up into the corresponding synthetic 
     * process.  
     */
	rollupProxied: function() {
		// for each process tree root...
		for (var i = 0; i < this.processTreeRoots.length; i++)
			// roll up proxied children, bottom-up, by working down the process tree...
			this._rollupProxiedDFS(this.processTreeRoots[i]);
	},

	/**
	 * Stack processes up using depth-first-search scheme then rolling up proxied.
	 */
	_rollupProxiedDFS: function(proc) {
		var procs = [];	
		var executed = [];
		procs.push(proc);
		proc.visited = true;
		while( procs.length > 0) {
			var topProc = procs[procs.length - 1]; //peek()
			var shouldPop = true;
			if (topProc._kids) {
				for (var kid_pid in topProc._kids) {
					var kid = this.getProcess(kid_pid);
					if( kid && !kid.visited) {
						kid.visited = true;
						procs.push(kid);
						shouldPop = false;
					}
				}
			} 

			if( shouldPop ) {
				procs.pop();
				this._rollupProxied(topProc);
				executed.push(topProc);
			}
		}
		// clean up 'visited' flag
		while( executed.length > 0 ) {
			var prc = executed.pop();
			prc.visited = undefined;
		}
	},


	/**
     * Depth-first recursive descent super-server identification and rollup of proxied child processes.
     */
	_rollupProxied: function(proc) {
		var portAndIp, conn, syn_pic, syn_proc;

		// if this process is a super-server, make a synthetic process for any ports it's listening on...
		var isSuperServer = this.isSuperServer(proc);
		if (isSuperServer) {
			for (portAndIp in proc._listening_on) {
				conn = proc._listening_on[portAndIp];
				syn_pid = '' + (1000000000 + (conn.port - 0));
				syn_proc = this.byPID[syn_pid];

				// make only one synthetic process per port...
				if (syn_proc) {
					conn.pid = syn_proc.pid;
					continue;
				}

				// Find the ppid of the synthetic process, it should be the highest one in the process tree that listens on the port
				var parentProcess = this.byPID[proc.ppid];
				var childProcess = proc;
				while (parentProcess && this.activeOn(parentProcess, conn.portAndIp)){
					childProcess = parentProcess;
					parentProcess = this.byPID[parentProcess.ppid];
				}

				// make our synthetic process...
				var kid_name = 'Service on port ' + conn.port;
				var kid_pid = '' + (1000000000 + (conn.port - 0));
				syn_proc = {name:kid_name, command:kid_name, parameters:'', pid:kid_pid, ppid:childProcess.pid, _listening_on: { }, _kids:{}};
				syn_proc._listening_on[conn.portAndIp] = conn;
				conn.pid = syn_proc.pid;
				this.rps.push(syn_proc);
				this.byPID[kid_pid] = syn_proc;
				this.byPortAndIp[conn.portAndIp] = syn_proc;
			}

			// drop the listening on ports from the super-server...
			delete proc._listening_on;
		} else {
			// if this process is not itself a super-server, but is active on a super-server's port, roll it up into our synthetic process...
			for (var ss_portAndIp in this.byPortAndIp) {
				syn_proc = this.byPortAndIp[ss_portAndIp];
				//Make sure it hasn't already matched to a real process.
				if(syn_proc.matched_to_real_proc)
					continue;

				if (this.activeOn(proc, ss_portAndIp)) {
					var syn_proc = this.byPortAndIp[ss_portAndIp];

					// copy the details to our synthetic process...
					syn_proc.name = proc.name;
					syn_proc.command = proc.command;
					syn_proc.parameters = proc.parameters;
					syn_proc.matched_to_real_proc = true;

					// tell the new parent about the new kids...
					for (var kid_pid in proc._kids)
						syn_proc._kids[kid_pid] = true;

					// delete the kid from its original parent's kid collection...
					if(this.getProcess(proc.ppid) && this.getProcess(proc.ppid)._kids[proc.pid])
						delete this.getProcess(proc.ppid)._kids[proc.pid];

					// send any reference to the child straight to the parent...
					this.byPID[proc.pid] = syn_proc;

					// if any other process was redirected to this one, redirect it to the parent as well...
					for (var test_pid in this.byPID) {
						var test_proc = this.byPID[test_pid];
						if (test_pid == test_proc.pid)
							continue;
						if (test_proc.pid != proc.pid)
							continue;
						this.byPID[test_pid] = syn_proc;
					}
				}
			}
		}
	},

	/**
     * Returns true if the given process info map represents a super-server.  Detects a super-server either by matching the 
     * process name, or by finding child processes with connections on the same local port as the given process is listening
     * on.  If a super-server has already been identified for a given port, a new one will not be identified for that port.
     */
	isSuperServer: function(proc) {

		// if this process' name is one of our defined super-server names, return true...
		if (this.super_servers[proc.name])
			return true;

		// iterate over all the ports this process is listening on...
		for (var lstn_portAndIp in proc._listening_on) {

			// if we already have a super-server for this port, move along...
			if (this.byPortAndIp[lstn_portAndIp])
				continue;

			// iterate over all the child processes...
			for (var kid_pid in proc._kids) {
				if (this.activeOn(this.getProcess(kid_pid), lstn_portAndIp))
					return true;
			}
		}

		// if we get here, it's not a super-server...
		return false;
	},

	/**
     * Returns true if the given process is listening on the given port
     */
	activeOn: function(proc, portAndIp) {
		return this.listeningOn(proc, portAndIp);
	},

	/**
     * Returns true if the given process is connecting from the given port.
     */
	connectingFrom: function(proc, portAndIp) {
		return proc && proc._connecting_to && !!proc._connecting_to[portAndIp];
	},

	/**
     * Returns true if the given process is listening on the given port.
     */
	listeningOn: function(proc, portAndIp) {
		return proc && proc._listening_on && !!proc._listening_on[portAndIp];
	},

	/**
     * Any process may be listening to any number of ports and connecting to any number of ports.
     * This method adds _listening_to and _connecting_to arrays to each process that has a connection,
     * and populates them.
     */
	mapConnectionsByProcess: function() {
		for (var name in this.byPID) {
			this.byPID[name]._listening_on = { };
			this.byPID[name]._connecting_to = { };
		}

		// iterate over all our connections...
		for (var i = 0; i < this.conns.length; i++) {
			var conn = this.conns[i];
			conn.portAndIp = conn.port + ':' + conn.ip;
			var pid = '' + conn.pid;
			var proc = this.byPID[pid];
			if (!proc)
				continue;

			if (conn.type == 'on')
				proc._listening_on[conn.portAndIp] = conn;
			else if (conn.type == 'to')
				proc._connecting_to[conn.portAndIp] = conn;
		}
	},

	/**
 	* Detects forked child processes and rolls them up into their parent.
 	*
 	* A forked process is one that has the same command and parameters as its
 	* parent. Forking can occur across multiple levels, so rollup is performed
 	* in post-order (children processed before their parent).
 	*
 	* The implementation uses an explicit iterative DFS. Each frame tracks the
 	* process, its parent, and the traversal state. A visited-PID set ensures
 	* each process node is handled once. When a forked child is detected, its
 	* TCP connections and descendants are merged into the parent, and the
 	* parent's child map is updated accordingly.
 	*
 	*/

	rollupForked: function() {
    	var roots = this.processTreeRoots;
    	var byPID = this.byPID;
    	var stack = [];
    	var i, j, proc, parent, pid, kidPids, kid;

    	// Seed stack with all roots
    	for (i = 0; i < roots.length; i++) {
        	stack.push({ proc: roots[i], parent: null, state: 0 });
    	}

    	while (stack.length > 0) {
        	var frame = stack[stack.length - 1];

        	// FIRST PASS: push children
        	if (frame.state === 0) {
            	proc = frame.proc;
            	pid = proc.pid + '';
            	frame.state = 1;

            	if (proc._kids) {
                	kidPids = Object.keys(proc._kids);
                	for (j = 0; j < kidPids.length; j++) {
                    	kid = byPID[kidPids[j]];
                    	if (kid) {
                        	stack.push({ proc: kid, parent: proc, state: 0 });
                    	}
                	}
            	}

            	continue;
        	}
			
        	// SECOND PASS: post-order → rollup
        	stack.pop();

        	proc = frame.proc;
        	parent = frame.parent;

        	// Root has no parent → nothing to roll up
        	if (!parent)
            	continue;

        	// Only roll up forked clones (same command + parameters)
        	if (proc.command !== parent.command || proc.parameters !== parent.parameters)
            	continue;

        	// Merge this child's TCP data into the parent
        	this._rollupConnections(proc, parent);

        	// Re-parent grandchildren
        	if (proc._kids) {
            	if (!parent._kids) parent._kids = {};
            	for (pid in proc._kids) {
                	parent._kids[pid] = true;
            	}
        	}

        	// Remove child from parent's direct children
        	if (parent._kids && parent._kids[proc.pid + ''])
            	delete parent._kids[proc.pid + ''];

        	// Redirect references of this PID → parent
        	byPID[proc.pid + ''] = parent;
		delete proc._kids;

        	
    	}
	},


	_rollupConnections: function(proc, parent) {
		var portAndIp;

		if (proc._listening_on) {
			parent._listening_on = parent._listening_on || { };
			for (portAndIp in proc._listening_on)
				parent._listening_on[portAndIp] = proc._listening_on[portAndIp];
		}

		if (proc._connecting_to) {
			parent._connecting_to = parent._connecting_to || { };
			for (portAndIp in proc._connecting_to)
				parent._connecting_to[portAndIp] = proc._connecting_to[portAndIp];
		}
	},


	/**
     * Populates this.byPID map, using the string form of the PID as the key and the info map from this.rps as the value.
     */
	indexPIDs: function() {
		this.byPID = {};
		for (var i = 0; i < this.rps.length; i++) {
			this.byPID['' + this.rps[i].pid] = this.rps[i];
		}
	},

	/**
     * Gathers the children of all parent processes, and identifies and records the roots of all process trees.
     */
	buildProcessTree: function() {
		this.processTreeRoots = [];

		// iterate over all the indexed processes...
		for (var pid in this.byPID) {
			var proc = this.byPID[pid];

			// if we don't have an info map for the parent, we've got a new root...
			var parent = this.getProcess(proc.ppid);
			if (!parent) {
				this.processTreeRoots.push(proc);
				continue;
			}

			// record the child PID...
			if (!parent._kids)
				parent._kids = {};
			parent._kids[pid] = true;
		}
	},

	/**
     * Given a PID, return the process info map (or null if that map doesn't exist).
     */
	getProcess: function(pid) {
		return this.byPID['' + pid];
	},

	/**
     * Returns a map of port number to name for all IP services configured in an instance.
     */
	get_services: function() {
		var gr = new GlideRecord('cmdb_ip_service');
		gr.addQuery('protocol', '!=', 'UDP');
		gr.query();
		var result = {};
		while (gr.next())
			result['' + gr.port] = '' + gr.name;
		return result;
	},

	/**
     * Eliminate any duplicate connections caused by rollups or synthetic processes...
     */
	dedupeConnections: function() {
		var conns = this.sensor.connections;
		var map = {};
		for (var i = 0; i < conns.length; i++) {
			var conn = conns[i];
			var key = conn.type + ':' + conn.ip + ':' + conn.port + ':' + conn.process;

			// if we've seen a connection with this key before...
			if (map[key]) {
				conns.splice(i, 1);  // delete the current connection...
				i--;  // back up our index, 'cause we're gonna look at the same element again...
				continue;
			}
			map[key] = true;
		}
	},

	/**
	 * Does process or any parent process listen on this port?
	 */
	_listensOnPort : function(port, proc) {
		var curr_pid = proc.pid;
		var syn_pid = '' + (1000000000 + (port - 0)); // compute synthetic pid
		var syn_proc = this.byPID[syn_pid]; // get the process for the synthetic, may not be there
		var pids = [ ];

		while (curr_pid) {
			pids.push(curr_pid);

			var curr_proc = this.byPID[curr_pid];

			// Get out of here if we can't find process for whatever reason
			if (!curr_proc)
				return;

			// If process there and it contains listening port same as ours get rid of it else traverse up the tree
			// Also check that the synthetic process is listening on the same port and it's parent(ppid) matches current pid as we traverse up the tree
			if (curr_proc._listening_on_ports && curr_proc._listening_on_ports[port])
				return curr_proc; 

			if (syn_proc && syn_proc.ppid == curr_pid)
				return syn_proc; 

			curr_pid = curr_proc.ppid;

			// Make sure the process isn't its own ancestor - this would cause an infinite loop.
			// A process can become its own ancestor during process rollup.
			if (pids.some(function(pid) { return pid == curr_pid; } ))
				return;
		}
	},


	/**
     * Find local IPs from the tcp connections "on" connections.
	 * This should only be used for tcp connection manipulation and nothing else. 
	 * It is entirely possible "127.0.0.1" is not here because we are not listening on it.
	 */	
	_setLocalIPs : function() {
		for (var i = 0; i < this.conns.length; i++) {
			var conn = this.conns[i];

			if (conn.type == "on")
				this.localIPs[conn.ip] = true;
		}
	},

	type: 'EnrichProcessesAndConnections'
};
