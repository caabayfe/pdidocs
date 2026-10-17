var EpSuggestions = Class.create();
EpSuggestions.prototype = {
    initialize: function() {
        this.procIds = [];
        this.procs = {};
        this.ip2node = {};
        this.candidates = [];
    },
    
    createNetstat : function() {
		if (!GlidePluginManager.isActive('com.snc.service-mapping')) {
		   gs.debug("Method call to createNetstat aborted since the Service Mapping plugin is not active");
		   return;
		}
		var SOURCE = "netstat";
		this.createNodes();
		this.createEdges();
		this.findCandidates();
		this.writeCandidates(SOURCE);  
		this.cleanupCandidatesWithEPs(SOURCE);
    },

    createNetflow: function() {
		if (!GlidePluginManager.isActive('com.snc.service-mapping')) {
		   gs.debug("Method call to createNetflow aborted since the Service Mapping plugin is not active");
		   return;
		}
        var SOURCE = "netflow";
        this.createGraphFlow();
        this.findCandidates();
        this.writeCandidates(SOURCE);
        this.cleanupCandidatesWithEPs(SOURCE);
    },

    createGraphFlow: function(){
        var flow = new GlideRecord("sa_flow_connection");
        flow.query();
        while (flow.next()) {
            var src = flow.ip + ":" + flow.port;
            var dst = flow.dest_ip + ":" + flow.dest_port;
            var srcNode = this.mkNode(src);
            var dstNode = this.mkNode(dst);            
            dstNode.inc.push({ip_port: dst, src: srcNode});
            srcNode.out.push({ip_port: dst, trg: dstNode});
        }
    },

    mkNode: function(id) {
        var node = this.procs[id];
        if (node == null) {
            node = {process: id, inc: [], out: [], lstn: [id]};
            this.procs[id] = node;
        }
        return node;
    },
    
    createNodes: function() {
		
		var MAX_ALLOWED_PROCS = parseInt(gs.getProperty("sa.traffic_based_discovery.ep_suggestions_max_allowed_procs", 200000)) || 200000;
        
        // Find all listeners which also have outgoing connections
        var tcpon = new GlideRecord("cmdb_tcp");
        tcpon.addQuery("type", "on");
        tcpon.addQuery("absent", false);

        // Do a self join to find all the processes that have 'connecting to' type as well
        var join = tcpon.addJoinQuery("cmdb_tcp", "process", "process");
        join.addCondition("type", "to");
        join.addCondition("absent", false);
        tcpon.query();

		var numOfProcs = tcpon.getRowCount();
        gs.debug("found " + numOfProcs + " results.");
		//to avoid excessive memory consumption, we are stopping the scheduled job that calls this script
		//when the connecting processes number threshold is breached.
		if (numOfProcs > MAX_ALLOWED_PROCS ) {
			gs.debug("Processes number exceeded the allowed threshold. Deactivating the Generate entry point candidates scheduled job. To activate it again change the allowed procs threshold and activate the scheduled job.");
			//deactivate the "Generate entry point candidates" scheduled job and stop the computation.
			this.stopCandidatesScheduler();
			return;
		}	
		
        // Populate the nodes data structures
        while (tcpon.next()) {
			var node = {process: "" + tcpon.getValue("process"), computer: "" + tcpon.getValue("computer"), inc: [], out: [], lstn: []};
            var ip_port = tcpon.getValue("ip") + ":" + tcpon.getValue("port");
            if (this.procs[node.process] != null) 
                node = this.procs[node.process];
            else
                this.procs[node.process] = node;

            this.ip2node[ip_port] = node;
            node.lstn.push(ip_port);
        }

		for (var proc in this.procs)
            this.procIds.push(proc);
    },
	
	stopCandidatesScheduler: function() {

		//deactivate the scheduled job "Generate entry point candidates from netflow and netstat data"
		var gr = new GlideRecord("sysauto_script");
		gr.addQuery("sys_id", "b0b95067c3d0030039a3553a81d3aeb5");
		gr.query();
		if (gr.next()) {
			gr.setValue('active', 'false');
			gr.update();
		}
    },

    createEdges: function() {

		var MAX_CHUNK_SIZE = parseInt(gs.getProperty("sa.traffic_based_discovery.ep_suggestions_max_chunk_size", 1000)) || 1000;
		var numOfProc = this.procIds.length;
		// split the proc list into smaller chunks and call createEdgesByChunk
		var ind = 0;
		var procList = [];		
		while (ind < numOfProc) {			
			procList = this.procIds.slice(ind, ind + MAX_CHUNK_SIZE);
			this.createEdgesByChunk(procList);
			ind = ind + MAX_CHUNK_SIZE;
		}
    },
	
	createEdgesByChunk: function(procList) {

		// Find all the the outgoing connections from the processes with listening ports open
		var tcpto = new GlideRecord("cmdb_tcp");
        tcpto.addQuery("type", "to");
        tcpto.addQuery("absent", false);
        tcpto.addQuery("process", "IN", procList);
        tcpto.query();
		while (tcpto.next()) {          
            var src = this.procs["" + tcpto.process];            
            // todo: handle localhost
            var ip_port = tcpto.getValue("ip") + ":" +tcpto.getValue("port");
            
            var trg = this.ip2node[ip_port];
            if (src != null && trg != null) {
                trg.inc.push({ip_port: ip_port, src: src});
                src.out.push({ip_port: ip_port, trg: trg});
            }
        }
    },

    findCandidates: function() {
        // filter the process having http port and sort by # of incoming edges        
        var startNodes = [];
        // gs.print('procs are : ' + JSON.stringify(this.procs));
        for (var sys_id in this.procs) {
            var proc = this.procs[sys_id];
            gs.print('checking out proc: ' + proc.process);
            if (this.isValidEp(proc.lstn))
                startNodes.push(proc);
        }
        startNodes.sort(function(a, b) {
            return a.inc.length - b.inc.length;
        });

        gs.debug('got ' + startNodes.length + ' start nodes');
        for (var i = 0; i < startNodes.length; i++) {
            var node = startNodes[i];
            if (node.visited)
                continue;

            this.walk(node);
            gs.print('adding candidate: ' + JSON.stringify(node.lstn));
            this.candidates.push(node);
        }
    },

    walk: function(node) {
        // gs.print('walk: ' + JSON.stringify(node.lstn) + " visited: " + node.visited);
        if (node.visited)
            return;

        node.visited = true;
        for (var i = 0; i < node.out.length; i++)
            this.walk(node.out[i].trg);
    },
  
    writeCandidates: function(source) {
        var query = function(gr, vals) {
            for (var key in vals) {
                gr.addQuery(key, vals[key]);
            }
            return gr.query();
        };

        var update = function(gr, vals) {
            gr.setForceUpdate(true);
            for (var key in vals) {
                gr.setValue(key, vals[key]);
            }
            return gr.update();
        };

        var insert = function(gr, vals) {
            for (var key in vals) {
                gr.setValue(key, vals[key]);
            }
            return gr.insert();                
        };

        gs.debug('found ' + this.candidates.length + ' ep candidate processes');
        var gr, cand, ip_port, ip_port_spl, vals;
        for (var i = 0; i < this.candidates.length; i++) {
            cand = this.candidates[i];
            for (var j = 0; j < cand.lstn.length; j++) {
                ip_port = cand.lstn[j];
                if (this.isPortHttp(ip_port)) {
                    ip_port_spl = ip_port.split(":");                    
                    gr = new GlideRecord('sa_cand_entry_point');    
                    vals = { name : ip_port, ip_address: ip_port_spl[0], port: ip_port_spl[1], source: source };
                    query(gr, vals);
                    if (!gr.next()) { 
                        vals["ignore"] = false;
                        insert(gr, vals);
                    }
                    
                }
            }            
        }
    },

    isValidEp: function(list) {
        gs.print('listeners are ' + JSON.stringify(list));
        for (var i = 0; i < list.length; i++) {
            var ip_port = list[i];
            gs.print('ip_port ' + ip_port);
            if (this.isPortHttp(ip_port) && !this.isLoopback(ip_port))
                return true;
        }
        gs.print('invalid eps for this process');
        return false;
    },

    isLoopback: function(ip_port) {
        var startsWith = function(str, suffix) {
            return str.indexOf(suffix) == 0;
        };

        return startsWith(ip_port, "127.0.0.1:") || startsWith(ip_port, "0.0.0.0:");
    },

    isPortHttp: function(ip_port) {
        var endsWith = function(str, suffix) {
            return str.indexOf(suffix) + suffix.length == str.length;
        };
        return endsWith(ip_port, ":80") || endsWith(ip_port, ":443");
    },
  
    cleanupCandidatesWithEPs : function(source) {
        var gr = new GlideRecord('sa_cand_entry_point');    
        gr.addQuery('ignore', false);
        gr.addQuery('source', source);
        gr.addQuery('port', 80).addOrCondition('port', 443);
        var join = gr.addJoinQuery('cmdb_ci_endpoint', 'ip_address', 'ip_address');
        join.addCondition('port', 80).addOrCondition('port', 443);
        gr.query();
        while (gr.next()) {
            gs.debug('ignoring candidate ' + gr.name);
            gr.ignore = true;
            gr.update();
        }
    },

    type: 'EpSuggestions'
};
