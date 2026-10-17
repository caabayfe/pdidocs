// Discovery

var ApplicationDependencyMapping = Class.create();

ApplicationDependencyMapping.map = function(source, status, classificationProbe) {
    var dh = SncDeviceHistory.getFromSourceAndStatusAndClassification(source, status, classificationProbe);
    var adm = new ApplicationDependencyMapping();
    adm.initializeForMapping('' + dh.getCmdbCi());
    adm.map();
    gs.eventQueue('discovery.device.adm.mapping_complete', 'discovery_device_history', '' + dh.getSysID(), dh.getCmdbCi());
};

ApplicationDependencyMapping.prototype = {

    /**
     * Initializes a new instance of this class.  The given sensor must be the DiscoveryADMSensor that created
     * this instance.
     */
    initialize: function(sensor) {
        if (typeof sensor == 'undefined') //no arg when used for mapping alone
            return;

        this.sensor = sensor;

        // store all our matched running processes
        this.matched_processes = this.get_matches();
    },

    /*
     *	Reset objects from classification in original sensor run
     */
    initializeForMapping: function(ciId) {
        var ciGr = new GlideRecord('cmdb_ci_computer');
        ciGr.get(ciId);
        this.ci_sys_id = '' + ciId;
        this.ci_name = '' + ciGr.name;

        this.classified = {};
        this.procByID = {};
    },

    /**
     * Called by DiscoveryADMSensor after running processes and connections have been enriched and saved to to
     * the database.
     *
     * This function does two quite separate things.  First, it classifies the running processes (this used to be
     * done in the running process sensor, but was moved here so that it takes place after enrichment).  Second,
     * it does the actual application dependency mapping.
     */
    process: function() {
        // capture information about the CI...
        this.ci_sys_id = '' + this.sensor.getCmdbCi();
        var cigr = this.sensor.getCmdbRecord();
        if (!cigr)
            return;

        this.clusterGr = this.getCluster();
        this.clusterIPs = [];
        if (JSUtil.notNil(this.clusterGr))
            this.clusterIPs = this.getClusterIPs();

        this.ci_table = '' + cigr.sys_class_name;
        this.ci_name = '' + cigr.name;
        this.indexByID();

        this.classified = this.classify();
        this.deferMapping();
    },

    deferMapping: function() {
        if (gs.getProperty('glide.discovery.application_mapping') != 'true' || !g_device)
            return;

        g_device.setStopWorkflow(true);
        g_device.setScratchpadValue('requires_adm', 'true');
        g_device.setStopWorkflow(false);
    },

    // Returns the first valid cluster where this CI is a node
    getCluster: function() {
        var gr = new GlideRecord("cmdb_ci_cluster_node");
        gr.addQuery("server", this.ci_sys_id);
        gr.query();
        while (gr.next()) {
            var cluster = new GlideRecord("cmdb_ci_cluster");
            if (!cluster.get(gr.cluster))
                continue;

            return cluster;
        }

        return;
    },

    // Return an array of Cluster IPs
    getClusterIPs: function() {
        var vips = {};
        var gr = new GlideRecord("cmdb_ci_cluster_vip");
        gr.addQuery("cluster", this.clusterGr.sys_id);
        gr.query();
        while (gr.next())
            vips[gr.ip_address + ''] = true;

        return vips;
    },


    /**
     * Look for opportunities for application dependency mapping on the current CI.  Any opportunties will result in
     * a call to onConnection().
     */
    map: function() {
        // build classified (processes) object
        this.classified = this.queryForConnections();

        // build our (potentially quite large) query for connections...
        var gr = this.queryForOtherSide();

        // get all our matched connections...
        var matches = this.matchConnections(gr);

        // if we didn't find any matches, skip the rest of this...
        if (matches.length == 0)
            return;

        this.findForeignClassifieds(matches);
        this.findForeignProcesses(matches);
        this.autoClassify(matches);

        // make sure our dependencies all get recorded in the database...
        this.ensureDependencies(matches);
    },

    /**
     * Ensure that all the application dependencies in the given matches are actually recorded in the database.
     */
    ensureDependencies: function(matches) {
        var queryParent,
            _this = this,
            children = {},
            gr = new GlideRecord('cmdb_rel_ci'),
            relType = new DiscoveryFunctions().findOrCreateRelationshipType("cmdb_rel_type", "Depends on::Used by");

        matches.sort(sortByParent);
        matches.forEach(ensure);
        updateDb(); // Call this one more time to handle the last parent

        // The sort() above effectively groups records by parent.  This code will collect child sys_id and port
        // for children of a single parent.  When it's called with a new parent it will write all relationships
        // for the previous parent.
        // This is a re-write of a previous less efficient implementation.  That code grouped records when
        // updating so I did the same.  This would make sense if we wanted to delete children which are no
        // longer present, but we don't do that.
        function ensure(match) {
            var parent = _this.classified[match.from.process].app,
                child = _this.classified[match.to.process].app,
                port = match.to.port;

            if (parent != queryParent) {
                updateDb();
                queryParent = parent;
            }
            children[child] = port;
        }

        function updateDb() {
            if (!queryParent)
                return;

            var name, child,
                gr = new GlideRecord('cmdb_rel_ci');

            // Update ports if necessary
            gr.addQuery('parent', queryParent);
            gr.addQuery('type', relType);
            gr.addQuery('child', 'IN', Object.keys(children));
            gr.query();
            while (gr.next()) {
                child = gr.child + '';
                gr.port = children[child];
                gr.update();
                children[child] = undefined;
            }

            // And insert anything that's new
            for (name in children) {
                if (children[name] !== undefined) {
                    gr = new GlideRecord('cmdb_rel_ci');

                    gr.parent = queryParent;
                    gr.child = name;
                    gr.type = relType;
                    gr.port = children[name];
                    gr.insert();
                }
            }
            // Reset to prepare for the next parent.
            children = {};
        }

        function sortByParent(a, b) {
            var aParent = _this.classified[a.from.process].app,
                bParent = _this.classified[b.from.process].app;

            if (aParent > bParent)
                return 1;
            if (aParent < bParent)
                return -1;
            return 0;
        }
    },

    /**
     * Attempt to auto-classify any processes in the matches that are not already classified.  If auto-classification
     * can't be done for any reason, delete the match.
     */
    autoClassify: function(matches) {
        var procsToAutoClassify = [];

        // look at all our matches to see which ones need auto-classification...
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];

            // If a process is talking to itself, then let's take it out the match array and skip it
            var talkingToMyself = (match.from.process == match.to.process);
            if (talkingToMyself) {
                matches.splice(i, 1);
                i--;
                continue;
            }

            // if both our matched processes are already classified, then we don't need to auto-classify...
            var from_classified = !!this.classified[match.from.process];
            var to_classified = !!this.classified[match.to.process];
            if (from_classified && to_classified)
                continue;

            // if we need to auto-classify, but can't, then delete this match...
            if (!this.shouldAutoClassify(match.from.process) || !this.shouldAutoClassify(match.to.process)) {
                matches.splice(i, 1);
                i--;
                continue;
            } else {
                // Keep track of the ones we do need to auto classify
                if (!from_classified)
                    procsToAutoClassify.push(match.from.process);

                if (!to_classified)
                    procsToAutoClassify.push(match.to.process);
            }
        }

        // If no process requires auto classification... just get out...
        if (procsToAutoClassify.length == 0)
            return;

        var mutexName = '<<<-- ADM Pending Processor Classifier Mutex-->>>';
        var mutex = new Mutex(mutexName, mutexName);
        // limit our attempt to get a mutex to 120 seconds...
        mutex.setSpinWait(500);
        mutex.setMaxSpins(240);
        mutex.setMutexExpires(120000); //120 seconds
        if (mutex.get()) {
            try {

                for (var i = 0; i < procsToAutoClassify.length; i++)
                    this._autoClassify(procsToAutoClassify[i]);

            } finally {
                mutex.release();
            }
        } else {
            //lock failed... not risk creating it... bail...
            gs.log("Unable to get a lock to create auto classifiers");
        }

    },

    /**
     * Auto-classifies the process with the given sys_id.
     */
    _autoClassify: function(proc_id) {
        var proc_info = this.procByID[proc_id];

        //Make sure we have all the proc info we need (may not if this came from a furriner)
        if (!proc_info.command) {
            var runningProcGr = new GlideRecord('cmdb_running_process');
            runningProcGr.get(proc_info.sys_id);
            proc_info.command = runningProcGr.command;
            proc_info.key_parameters = runningProcGr.key_parameters;
        }

        var condition = makeClassifierCondition(this);
        if (shouldSkipCondition(condition))
            return;

        // figure out whether we've got a process to treat as connecting to or connecting from...
        var isTo = !!proc_info.listening_on;
        var isFrom = !!proc_info.connecting_to;

        // create our auto-classifier...
        var cgr = new GlideRecord('discovery_classy_proc');
        cgr.initialize();
        cgr.setWorkflow(false);
        cgr.order = 1000;
        cgr.name = 'Pending: ' + makeName();
        cgr.table = 'cmdb_ci_appl_pending';
        cgr.relation_type = new DiscoveryFunctions().findOrCreateRelationshipType("cmdb_rel_type", "RUns on::Runs");

        cgr.condition = condition;
        cgr.test_with.getGlideList().setValue(this.ci_sys_id);

        // It's possible to have another thread creating the exact same pending classifier, so we need to check to make sure
        // we don't already have it. If we do, we just use the classifier record we've found instead.
        var grr = new GlideRecord('discovery_classy_proc');
        if (grr.get("condition", cgr.condition))
            classifier = grr.sys_id;
        else
            classifier = '' + cgr.insert();

        // And if a pending application record already has a record representing this process... then we're done! Otherwise create a new one.
        var gap = new GlideRecord("cmdb_ci_appl_pending");
        if (gap.get("running_process", proc_id)) {
            app = gap.sys_id;
        } else {
            // create our application instance...
            var computer_name = (!!proc_info.computer_name) ? proc_info.computer_name : this.ci_name;
            var agr = new GlideRecord('cmdb_ci_appl_pending');
            agr.initialize();
            // We used to set category and subcategory here.  See PRB1319943.
            agr.classifier = classifier;
            agr.running_process = proc_id;
            agr.name = makeName() + '@' + computer_name;
            agr.first_discovered = '' + new GlideDateTime().getDisplayValue();
            agr.last_discovered = agr.first_discovered;
            agr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
            var app = '' + agr.insert();

            // create our "runs on" relationship...
            var rgr = new GlideRecord('cmdb_rel_ci');
            rgr.initialize();
            rgr.parent = app;
            rgr.child = proc_info.computer;
            rgr.type = '' + cgr.relation_type;
            rgr.insert();
        }
        // cache this in case we see it again...
        proc_info.app = app;
        this.classified[proc_id] = proc_info;

        /**
         * Returns a name for this classifier or application instance.  For "from" processes:
         *    Pending: connecting to <ports this process is connecting to>
         * For "to" processes:
         *    Pending: listening on <ports this process is listening on>
         */
        function makeName() {
            var name = proc_info.name + ' ';
            if (isFrom && isTo)
                name += 'connecting & listening';
            else if (isFrom)
                name += 'connecting to ' + listPorts(proc_info.connecting_to).join(', ');
            else if (isTo)
                name += 'listening on ' + listPorts(proc_info.listening_on).join(', ');

            // Limit the name to the field size, which is about 100.
            if (name.length > 90)
                name = name.substring(0, 90) + "...";

            return name;
        }

        /**
         * Given a string of colon-separated ports (like ":80:443:"), return an array of port numbers.
         */
        function listPorts(ports) {
            if (!ports)
                return [];

            var result = ports.split(':');
            if (result.length < 3)
                return [];

            // the first and last entries should always be empty, because of the framing colons...
            return result.slice(1, -1);
        }

        /**
         * Returns an encoded query that will look for processes like the current process.
         */
        function makeClassifierCondition(that) {
            var keyParams = proc_info.key_parameters;

            return 'name=' + proc_info.name.substring(0, 40) +
                '^command=' + proc_info.command +
                (JSUtil.notNil(keyParams) ? '^key_parameters=' + keyParams : '') +
                '^EQ';
        }

        /**
         * If the condition matches a process handler that is marked as do not classify in process handler, then get out...
         */
        function shouldSkipCondition(condition) {
            var gr = new GlideRecord("discovery_proc_handler");
            gr.addQuery("condition", condition);
            gr.addQuery("classify", "false");
            gr.setLimit(1);
            gr.query();
            if (gr.next())
                return true;

            return false;
        }
    },

    /**
     * Returns true if the given process sys_id should be auto-classified.
     */
    shouldAutoClassify: function(proc_id) {
        var shouldClassify = (this.procByID[proc_id] && (this.procByID[proc_id].classify == 'true'));
        var shouldAuto = gs.getProperty('glide.discovery.auto_adm', 'false') == 'true';
        return shouldClassify && shouldAuto;
    },

    /**
     * Make a map (in this.procByID) of all running processes by ID.
     */
    indexByID: function() {
        this.procByID = {};
        for (var i = 0; i < this.sensor.running_processes.length; i++) {
            var proc = this.sensor.running_processes[i];
            this.procByID[proc.sys_id] = proc;
        }
    },

    /**
     * Make records in this.classified for all the foreign (i.e., not from this computer) processes in the given list
     * of matched connections that have been classified.  We detect as classified those processes that have a matching
     * new-style application instance.  The matches list is in the form returned by this.matchConnections().
     * This method also enhances the match object to include both a to.app and a from.app entry.
     */
    findForeignClassifieds: function(matches) {
        // query for any foreign classified application instances...
        var procList = [];
        var agr = new GlideRecord('classified_apps');
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            procList.push('' + match.from.process);
            procList.push('' + match.to.process);
            if (i % 100 == 99 || i == (matches.length - 1)) {
                agr.addQuery('a_running_process', 'IN', procList);
                agr.addQuery('p_computer', '!=', this.ci_sys_id);
                agr.query();

                // use our results to update the this.classified and this.procByID maps with our furriners...
                while (agr.next()) {
                    // add the furriner entry to this.classified...
                    var tc = {};
                    tc.running_process = '' + agr.p_sys_id;
                    tc.classifier = '' + agr.c_sys_id;
                    tc.app = '' + agr.a_sys_id;
                    tc.computer = '' + agr.p_computer;
                    this.classified[tc.running_process] = tc;

                    // add the furriner entry to this.procByID...
                    var tp = {};
                    tp.sys_id = '' + agr.p_sys_id;
                    tp.computer = '' + agr.p_computer;
                    tp.name = '' + agr.p_name;
                    tp.listening_on = '' + agr.p_listening_on;
                    tp.connecting_to = '' + agr.p_connecting_to;
                    tp.classify = '' + agr.p_classify;
                    this.procByID[tp.sys_id] = tp;
                }
                procList = [];
                agr.initialize();
            }
        }
    },

    /**
     * Queries for process information for those foreign processes that have matched connections but which are not classified.
     * Updates the procByID map.
     */
    findForeignProcesses: function(matches) {
        // first we make a list of all those processes we need to get info on...
        var procs = [];
        for (var i = 0; i < matches.length; i++) {
            var match = matches[i];
            handleProcess(this, match.to.process, procs);
            handleProcess(this, match.from.process, procs);
        }

        // then we query for process information and fill it in...
        var gr = new GlideRecord('cmdb_running_process');
        gr.addQuery('sys_id', procs);
        gr.query();
        while (gr.next()) {
            var proc_info = {};
            proc_info.sys_id = '' + gr.sys_id;
            proc_info.computer = '' + gr.computer;
            proc_info.computer_name = '' + gr.computer.name;
            proc_info.name = '' + gr.name;
            proc_info.command = '' + gr.command;
            proc_info.key_parameters = '' + gr.key_parameters;
            proc_info.listening_on = '' + gr.listening_on;
            proc_info.connecting_to = '' + gr.connecting_to;
            proc_info.classify = '' + gr.classify;
            this.procByID[proc_info.sys_id] = proc_info;
        }

        /**
         * If the given process ID doesn't have informtion in procByID, add it to our list of procs to get information for.
         */
        function handleProcess(that, proc_id, procs) {
            if (!that.procByID[proc_id])
                procs.push(proc_id);
        }
    },

    /**
     * Match the connections found on this computer (in this.sensor.connections) with other connections in the database
     * (in the given GlideRecord instance gr), returning a list of matches with info objects whose properties are as follows:
     *
     * info object:
     *   from:
     *     process: sys_id of process (cmdb_running_process) on client side of connection
     *     ci: sys_id of the CI (cmdb_ci) running the client process
     *   to:
     *     process: sys_id of process (cmdb_running_process) on server side of connection
     *     ip: dotted-form v4 IP address of server device OR (if localhost) sys_id of CI (cmdb_ci)
     *     ci: sys_id of the CI (cmdb_ci) running the server process
     *     port: port number (1-65535) of port that server is listening on, and that client connected to
     */
    matchConnections: function(gr) {
        var deduper = {};
        var matches = [];
        while (gr.next()) {
            // build our connection information object...
            var cninfo = {
                from: {
                    ci: null,
                    process: null
                },
                to: {
                    ci: null,
                    process: null,
                    ip: null,
                    port: null
                }
            };
            if (gr.type == 'on') {
                cninfo.to.ci = '' + gr.computer;
                cninfo.to.process = '' + gr.process;
                cninfo.to.ip = '' + gr.ip;
                cninfo.to.port = '' + gr.port;
                cninfo.from.ci = this.ci_sys_id;
                cninfo.from.process = this.byKey[TCPKeyGenerator.getKey('to', gr.ip, this.ci_sys_id, gr.port)];
            } else {
                cninfo.from.ci = '' + gr.computer;
                cninfo.from.process = '' + gr.process;
                cninfo.to.ci = this.ci_sys_id;
                cninfo.to.process = this.byKey[TCPKeyGenerator.getKey('on', gr.ip, gr.computer, gr.port)];
                cninfo.to.ip = '' + gr.ip;
                cninfo.to.port = '' + gr.port;
            }

            // eliminate one of the pair of connections we'll find if both ends are on this CI (could be any IP)...
            var dd_key = cninfo.to.ci + ':' + cninfo.to.process + ':' + cninfo.to.ip + ':' + cninfo.to.port + ':' +
                cninfo.from.ci + ':' + cninfo.from.process;
            if (deduper[dd_key])
                continue;
            deduper[dd_key] = true;

            // it's a real match, so add it to our results...
            matches.push(cninfo);
        }

        return matches;
    },

    /*
     * Query for the connections found on this computer, returning a GlideRecord instance on the cmdb_tcp table.
     */
    queryForConnections: function() {
        var classified = {},
            grRel = new GlideRecord('cmdb_rel_ci'),
            relType = new DiscoveryFunctions().findOrCreateRelationshipType("cmdb_rel_type", "Runs on::Runs");

        grRel.addQuery('child', this.ci_sys_id);
        grRel.addQuery('type', relType);
        grRel.query();
        while (grRel.next()) {
            classified['' + grRel.parent.running_process] = {
                "app": '' + grRel.parent,
                "classifier": '' + grRel.parent.classifier,
                "computer": this.ci_sys_id,
                "running_process": '' + grRel.parent.running_process
            };
        }

        return classified;
    },




    /**
     * Query for the other side of connections found on this computer, returning a GlideRecord instance on the cmdb_tcp table.
     */
    queryForOtherSide: function() {
        var shouldAuto = gs.getProperty('glide.discovery.auto_adm', 'false') == 'true';
        var mapLocal = gs.getProperty('glide.discovery.adm.map_local_connection', 'false') == 'true';

        // iterate over all our connections, adding queries as we go and build our lookup map...
        this.byKey = {};
        this.keySet = [];

        var grTcp = new GlideRecord('cmdb_tcp');
        grTcp.addQuery('computer', this.ci_sys_id);
        grTcp.addQuery('absent', false);
        grTcp.query();
        while (grTcp.next()) {
            var ip = '' + grTcp.ip;

            if (!shouldAuto && !this.classified[grTcp.process])
                continue;

            if (!mapLocal && (ip.startsWith('127.') || ip == '::1') && !this.classified[grTcp.process])
                continue;

            // we're looking for the opposite type of the current connection, so we flip between the to and on,
            // but we keep the ip and port the same. And obviously, if the ip is a localhost (127.0.0.1) address, then
            // We need to specify the sys_id
            var type = (grTcp.type == 'on') ? 'to' : 'on';
            var matchKey = TCPKeyGenerator.getKey(type, ip, this.ci_sys_id, grTcp.port);
            this.keySet.push(matchKey);

            // and map it with a key we can recreate from the results, to find this connection again...
            var fromkey = TCPKeyGenerator.getKey(grTcp.type, ip, this.ci_sys_id, grTcp.port);
            this.byKey[fromkey] = '' + grTcp.process; // this used to be an entire 'connections' object entry but looks like we only consume the referenced process sys_id
        }

        // build our (potentially quite large) query for connections...
        var gr = new GlideRecord('cmdb_tcp');
        gr.addNotNullQuery('process');
        gr.addQuery('absent', false);
        gr.addQuery('key', this.keySet);
        // now let's see what we caught in our net...
        gr.query();

        return gr;
    },

    /*
     *  If the CI is part of a cluster, based on VIPs, determine what processes should be treated as a process running on the cluster rather than the nodes
     *  The clustered PIDs require the active connections probe. Without it, it's not posssible to determine the PIDs.
     */
    getClusteredPIDs: function() {
        if (JSUtil.nil(this.clusterGr))
            return {};

        var pids = {};
        for (var i = 0; i < this.sensor.connections.length; i++) {
            var conn = this.sensor.connections[i];
            if (conn.type != 'on')
                continue;

            if (conn.pid == 4) // Skipping Windows system process
                continue;

            if (this.clusterIPs[conn.ip])
                pids[conn.pid] = true;
        }

        return pids;
    },


    /**
     * Classify the running processes we have discovered and enriched.  Returns a map of running process sys_ids to
     * information objects containing these properties (for those running processes we have classified):
     *
     *   running_process: sys_id of running process
     *   classifier:      sys_id of classifier
     *   app:             sys_id of application instance
     *   computer:        sys_id of computer instance
     *   pid:            pid of the running process
     */
    classify: function() {
        // make our empty results map...
        // each object in here is mapped by running process sys_id, and contains these properties:
        //   running_process: sys_id of running process
        //
        var classified = {};
        this.paramsToPass = {};

        this.clusteredPIDs = this.getClusteredPIDs();

        // save the running processes that matched with a classifier...
        var matches = this.save_matches();

        // get all the existing discovery-created relationships between our CI and application instances...
        var existing_rels = this.get_existing_relationships();

        // get any app instances that can be tied to our CI, but which don't have relationships...
        var orphan_apps = this.get_orphaned_apps(matches, existing_rels);

        // setup a couple of GlideRecords we'll be needing...
        var app_gr;
        var rel_gr = new GlideRecord('cmdb_rel_ci');
        var accAgentId = this.sensor.accAgentId;

        // Use the CMDB Identification API if the property is true or service mapping plugin is active otherwise default to old implementation
        if (DiscoveryCMDBUtil.useCMDBIdentifiers())
            createOrUpdateMatches(this);
        else {
            // match any new-style exact matches...
            matchExactNewStyle(this);

            // match any new-style apps where the process has changed since the last discovery...
            matchFuzzyNewStyle(this);

            // look for any old-style app instances that match, and convert them to new-style...
            matchOldStyle(this);

            // create any new app or relationship records needed (the ones we couldn't find to this point)...
            createMatches(this);
        }
        // launch any probes we need to launch...
        if (!this.isPatternExecutionEnabledOnAgent(accAgentId))
            this.launchProbes(classified);

        var javaProcesses = this.get_matched_java_processes();
        //launch FBD for java processes
        if (isSamAndFBDActive()) {
            if (javaProcesses.length > 0) {
                DiscoveryLogger.info('Fire FBD Probes for Java Processes');
                triggerFBDProbes(javaProcesses, this, accAgentId);
            }
        }

        if (javaProcesses.length > 0 && isGlasActive()) {
            DiscoveryLogger.info('Triggering Java Pattern for Java Processes');
            try {
                this.launchJavaPattern(javaProcesses, accAgentId);
            } catch (e) {
                DiscoveryLogger.error('Failed to launch Java Pattern, ' + e);
            }
        }

        return classified;

        // B E G I N   I N N E R   F U N C T I O N S

        // iterate over our matches, looking first for exact new-style matches that we have existing relationships for...
        function matchExactNewStyle(that) {
            var currDateTime = '' + new GlideDateTime().getDisplayValue();

            for (var key in matches) {
                if (key.substr(0, 3) != 'EN:')
                    continue;

                if (existing_rels[key])
                    updateExistingMatch();
            }

            // if there's a matching existing relationship, mark it handled and delete it...
            function updateExistingMatch() {
                app_gr = new GlideRecordUtil().getCIGR(existing_rels[key].parent);
                if (app_gr) {
                    addScriptedFieldValuesToApp(app_gr, matches[key]);
                    app_gr.last_discovered = currDateTime;
                    app_gr.update();
                }
                matches[key]['__handled'] = true;
                existing_rels[key].app = existing_rels[key].parent;
                classified[matches[key].running_process] = existing_rels[key];
                delete existing_rels[key];
            }
        }

        function isSamAndFBDActive() {
            var pluginManager = new GlidePluginManager();
            var isSamActive = pluginManager.isActive("com.snc.sam.core") || pluginManager.isActive("com.snc.software_asset_management");
            var fbdActive = pluginManager.isActive("com.snc.discovery.file_based_discovery") && (gs.getProperty('glide.discovery.file_discovery.enabled',false) == 'true');
            return isSamActive && fbdActive;
        }

        function isGlasActive() {
            var pluginManager = new GlidePluginManager();
            var glasActive = pluginManager.isActive("sn_itom_oracleglas");
            return glasActive;
        }

        
        /**
 		* Triggers FBD (File-Based Discovery) probes for a list of Java processes.
 		* Supports both traditional MID server-based execution and Agent Client Collector (ACC-F) mode.
 		*
 		* @param {Array<Object>} javaProcesses - List of Java process objects with at least a `command` field.
 		* @param {Object} app - The Discovery application context providing access to sensor, agent, and OS utilities.
 		* @param {string} [accAgentId] - Optional ACC agent ID to run the probe through an agent instead of MID.
 		*/
        function triggerFBDProbes(javaProcesses, app, accAgentId) {
            var WINDOWS_FBD = "501d437ac3c5f1104759dc0f0501317c";
            var LINUX_FBD = "98086d9cc31d31104759dc0f05013189";
            var isWindows = app.getOSType() == 'windows' ? true : false;
            for (var i = 0; i < javaProcesses.length; i++) {
                var rp = javaProcesses[i];
                var rgr = new GlideRecord('discovery_probes');
                if (isWindows) {
                    rgr.addQuery('sys_id', WINDOWS_FBD);
                } else {
                    rgr.addQuery('sys_id', LINUX_FBD);
                }
                rgr.query();

                if (rgr.next()) {
                    var proc = rp;
                    var agentId, os_type, mid, mid_selector_details, source, ecc_id, port, priority;
                    if (accAgentId) {
                        var targetAgent = app.getTargetAgentDetails(accAgentId);
                        agentId = accAgentId;
                        os_type = targetAgent.osType + '';
                        mid = targetAgent.midServerName + '';
                        mid_selector_details = "{\"mode\":\"specific_mid\"}";
                        source = targetAgent.ipAddress + '';
                    } else {
                        source = app.sensor.getParameter('source') + '';
                        mid = app.sensor.getAgent() + '';
                        ecc_id = app.sensor.getEccQueueId() + '';
                        port = app.sensor.getParameter('port') + '';
                        priority = app.sensor.getParameter('priority');
                        mid_selector_details = app.sensor.getParameter('mid_selector_details');
                        os_type = app.getOSType() + '';      
                        
                    }

                    var probe = new SncProbe(rgr, proc);
                    probe.setSource(source);
                    probe.addParameter('os_type', os_type);
                    probe.addParameter('exe_command', rp.command);
                    probe.addParameter('used_by_discovery', 'true');
                    
                    if (accAgentId)
                        probe.addParameter('agent_id', agentId); // for ACC-F
                    if (port)
                        probe.addParameter('port', port);
                    if (priority)
                        probe.setEccPriority(priority);
                    if (mid_selector_details)
                        probe.setMidSelectDetails(mid_selector_details);
                        
                    var ssmObject = app.sensor.getParameter('ssm_object');

                    if (ssmObject)
                       probe.addParameter('ssm_object', ssmObject);


                    var prePatternExecutionData = {
    					fMapOfStrings: {
        					"isAgent": (accAgentId != null)
    					},
    					className: "PrePatternExecutionDTO"
					};
                    probe.addParameter('prePatternExecutionData', JSON.stringify(prePatternExecutionData));
                    
                    if (accAgentId)
                        probe.create(mid);
                    else
                        probe.create(mid, ecc_id);
                }
            }
        }

        // iterate over our matches again, now looking for fuzzy new-style matches that we have existing relationships for...
        function matchFuzzyNewStyle(that) {
            var currDateTime = '' + new GlideDateTime().getDisplayValue();
            for (var key in matches) {
                if ((key.substr(0, 3) != 'FN:') || matches[key].__handled)
                    continue;

                // if there's a matching existing relationship, mark it handled, and delete it from our existing relationships and update the db...
                if (existing_rels[key])
                    updateExistingMatch();
            }

            function updateExistingMatch() {
                app_gr = new GlideRecordUtil().getCIGR(existing_rels[key].parent);
                if (app_gr) {
                    var rp_gr = new GlideRecord("cmdb_running_process");
                    if (matches[key].running_process)
                        rp_gr.get('sys_id', matches[key].running_process);
                    if (JSUtil.notNil(rp_gr))
                        addRunningProcessInfoToApp(app_gr, rp_gr);

                    app_gr.running_process = matches[key].running_process;
                    addScriptedFieldValuesToApp(app_gr, matches[key]);
                    app_gr.last_discovered = currDateTime;
                    app_gr.update();
                    existing_rels[key].running_process = matches[key].running_process;
                }
                matches[key]['__handled'] = true;
                existing_rels[key].app = existing_rels[key].parent;
                classified[matches[key].running_process] = existing_rels[key];
                delete existing_rels[key];
            }

        }

        // iterate over our matches again, now looking for old-style matches that we have existing relationships for...
        function matchOldStyle(that) {
            var currDateTime = '' + new GlideDateTime().getDisplayValue();
            for (var key in matches) {
                if ((key.substr(0, 3) != 'EO:') || matches[key].__handled)
                    continue;

                // if there's a matching existing relationship, mark it handled, delete it, and note need to update the app instance...
                if (existing_rels[key]) {
                    app_gr = new GlideRecordUtil().getCIGR(existing_rels[key].parent);
                    if (app_gr) {
                        var rp_gr = new GlideRecord("cmdb_running_process");
                        if (matches[key].running_process)
                            rp_gr.get('sys_id', matches[key].running_process);
                        if (JSUtil.notNil(rp_gr))
                            addRunningProcessInfoToApp(app_gr, rp_gr);

                        app_gr.running_process = matches[key].running_process;
                        app_gr.classifier = matches[key].sys_id;
                        app_gr.correlation_id = 'NULL';
                        addScriptedFieldValuesToApp(app_gr, matches[key]);
                        app_gr.last_discovered = currDateTime;
                        app_gr.update();
                        existing_rels[key].running_process = matches[key].running_process;
                        existing_rels[key].classifier = matches[key].sys_id;
                    }
                    matches[key]['__handled'] = true;
                    existing_rels[key].app = existing_rels[key].parent;
                    classified[matches[key].running_process] = existing_rels[key];
                    delete existing_rels[key];
                }
            }
        }

        // now iterate over our unhandled matches with exact new-style match keys only, creating insert app instance and relationship records...
        function createMatches(parent_this) {
            var currDateTime = '' + new GlideDateTime().getDisplayValue();
            for (var key in matches) {
                var mk = matches[key];
                if ((key.substr(0, 3) != 'EN:') || mk.__handled)
                    continue;

                // add it to our classified map...
                var cl_info = {};
                cl_info.classifier = mk.sys_id;
                cl_info.running_process = mk.running_process;
                cl_info.computer = this.ci_sys_id;
                classified[mk.running_process] = cl_info;

                // if we've got an orphaned app here, just add a relationship for it...
                var orphan_id = orphan_apps[mk.cid];
                if (!orphan_id)
                    orphan_id = orphan_apps[mk.running_process];
                if (orphan_id) {
                    rel_gr.initialize();
                    rel_gr.type = mk.relation_type;
                    rel_gr.child = parent_this.ci_sys_id;
                    rel_gr.parent = orphan_id;
                    rel_gr.insert();
                    cl_info.app = orphan_id;
                    continue;
                }

                // insert our app instance record...
                app_gr = new GlideRecord(mk.table);
                app_gr.name = (mk.name.replace('Pending: ', '')) + '@' + parent_this.ci_name;
                app_gr.running_process = mk.running_process;
                app_gr.classifier = matches[key].sys_id;
                // We used to set category and subcategory here.  See PRB1319943.
                addScriptedFieldValuesToApp(app_gr, mk);
                app_gr.first_discovered = currDateTime;
                app_gr.last_discovered = currDateTime;
                if (JSUtil.notNil(accAgentId))
                    app_gr.discovery_source = parent_this.sensor.getCmdbRecord().discovery_source;
                else
                    app_gr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");

                var rp_gr = new GlideRecord("cmdb_running_process");
                if (mk.running_process)
                    rp_gr.get('sys_id', mk.running_process);
                if (JSUtil.notNil(rp_gr))
                    addRunningProcessInfoToApp(app_gr, rp_gr);

                app_sys_id = app_gr.insert();

                // insert our relationship record...
                rel_gr.initialize();
                rel_gr.type = mk.relation_type;
                rel_gr.child = parent_this.ci_sys_id;
                rel_gr.parent = app_sys_id;
                rel_gr.insert();

                // Grab existing clustered application if appropriate
                if (JSUtil.notNil(parent_this.clusterGr)) {
                    var existingClusteredAppSysId = new ADMUtil().reconcileExistingClusteredApp(parent_this.clusterGr, app_sys_id, mk.relation_type, parent_this.ci_sys_id + '');
                    if (existingClusteredAppSysId)
                        app_sys_id = existingClusteredAppSysId;
                }

                cl_info.app = '' + app_sys_id;

                // Tie application to cluster if appropriate
                if (parent_this.clusteredPIDs[mk.pid]) {
                    var clusterSysId = parent_this.clusterGr.sys_id;
                    var relName = DiscoveryFunctions.getRelationshipNameBySysId(mk.relation_type);
                    var rel_type = relName ? relName : "Runs on::Runs";
                    g_disco_functions.createRelationshipIfNotExists(app_sys_id, clusterSysId, rel_type);
                }
            }
        }

        // CMDB Identification API
        function createOrUpdateMatches(parent_this, runLegacyMode) {
            var currDateTime = '' + new GlideDateTime();
            var appIndex = 0;
            var appIndexToMatchesKey = {};
            var host_sys_id = '' + parent_this.ci_sys_id;
            var hostClass = undefined;
            var hostGr = new GlideRecord("cmdb_ci");
            if (hostGr.get(host_sys_id))
                hostClass = hostGr.getValue('sys_class_name');

            var irePayload = {
                items: [],
                relations: []
            };

            var runningProcessCache = cacheRunningProcesses(matches);

            for (var key in matches) {
                var mk = matches[key];
                if ((key.substr(0, 3) != 'EN:'))
                    continue;

                // Add it to our classified map...
                var cl_info = {};
                cl_info.classifier = mk.sys_id;
                cl_info.running_process = mk.running_process;
                cl_info.computer = this.ci_sys_id;
                classified[mk.running_process] = cl_info;

                // Handle orphaned apps
                var orphan_id = orphan_apps[mk.cid];
                if (!orphan_id)
                    orphan_id = orphan_apps[mk.running_process];
                if (orphan_id) {
                    rel_gr.initialize();
                    rel_gr.type = mk.relation_type;
                    rel_gr.child = parent_this.ci_sys_id;
                    rel_gr.parent = orphan_id;
                    rel_gr.insert();
                    cl_info.app = orphan_id;
                    continue;
                }

                // We need the related process command and parameters for CMDB Identification
                var rpCache = runningProcessCache[mk.running_process];
                if (!rpCache)
                    continue;

                // Checking if match active probe is of topic HorizontalDiscoveryProbe. If so, skipping creation of shell CI
                if (DiscoveryFunctions.isAProcessClassificationUsingPatterns(mk.sys_id)) {
                    cl_info.app = '';
                    // skip Discovery log for pattern execution on agents
                    if (typeof agent_correlator != 'undefined')
                        DiscoveryLogger.info("Launching Pattern for CI type " + mk.table + ", skipping creation of Shell CI", "ApplicationDependencyMapping", g_probe.getEccQueueId());
                    continue;
                }

                // Get the relationship type for CMDB Identification
                var rel_type = DiscoveryFunctions.getRelationshipNameBySysId(mk.relation_type);
                if (!rel_type)
                    continue;

                // Create container app GlideRecord for CMDB Identification
                app_gr = new GlideRecord(mk.table);
                app_gr.name = (mk.name.replace('Pending: ', '')) + '@' + parent_this.ci_name;
                app_gr.running_process = mk.running_process;
                addRunningProcessInfoToApp(app_gr, rpCache);
                app_gr.classifier = mk.sys_id;
                // We used to set category and subcategory here.  See PRB1319943.
                if (JSUtil.notNil(accAgentId))
                    app_gr.discovery_source = parent_this.sensor.getCmdbRecord().discovery_source;
                else
                    app_gr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
                addScriptedFieldValuesToApp(app_gr, mk);

                // Legacy mode is the old way when we call IRE per app.
                // We will call that only if calling IRE with all apps together failed.
                if (runLegacyMode) {
                    var appSysId = legacyCreateOrUpdateApp();
                    cl_info.app = appSysId;
                } else {
                    appIndex = addCmdbAppToIrePayload(app_gr, host_sys_id, hostClass, rel_type);
                    appIndexToMatchesKey[appIndex] = key;
                }
            }

            // If IRE failed for all apps - try again, one at a time (legacy mode).
            if (!commitAppsPayload()) {
                createOrUpdateMatches(parent_this, true);
            }

            // ---- END OF METHOD --- INTERNAL FUNCTION START 

            function addCmdbAppToIrePayload(gr, hostSysId, hostClass, relName) {
                var values = {};

                for (var grField in gr) {
                    if (values[grField])
                        continue;

                    var value = gr.getValue(grField);
                    if (JSUtil.nil(value))
                        continue;

                    values[grField] = value;
                }

                // if not host
                if (!irePayload.items[0]) {
                    var hostPayload = {};
                    hostPayload.className = hostClass;
                    hostPayload.values = {};
                    hostPayload.values.sys_id = hostSysId;
                    irePayload.items.push(hostPayload);
                }

                var appPayload = {};
                appPayload.className = gr.getTableName();
                appPayload.values = values;
                irePayload.items.push(appPayload);

                var appIndex = irePayload.items.length - 1;
                relName = relName || "Runs on::Runs";
                var relPayload = {};
                relPayload.child = 0;
                relPayload.parent = appIndex;
                relPayload.type = relName;
                irePayload.relations.push(relPayload);

                return appIndex;
            }

            function commitAppsPayload() {
                try {
                    // Exit first if this is legacy mode.
                    if (runLegacyMode)
                        return true;

                    var sucess = true;
                    // try multiple update
                    var op = {};
                    // Making sure g_probe is defined properly; for example in ACC g_probe is not define.
                    // Setting it to undefined if it is not defined.
                    // If g_probe is defined, typeof g_probe !== 'undefined' will fail, as g_probe is an object of type com.snc.core_automation.Probe
                    // Simple g_probe check like "if(g_probe)" will throw an error if it is not defined, hence defining it to undefined, if not defined earlier.
                    try {
                        if(g_probe) ;
                    } catch(e) {
                        g_probe = undefined;
                    }
                    if (g_probe && typeof g_probe.getParameter === 'function' && g_probe.getParameter('update_sys_object_source_last_scan') == 'false') {
                        op.skip_updating_last_scan_to_now = true;
                    }

                    var discoverySource = gs.getProperty('glide.discovery.source_name', "ServiceNow");
                    try {
                        if (JSUtil.notNil(accAgentId))
                          discoverySource = parent_this.sensor.getCmdbRecord().discovery_source;
                    }
                    catch(e) {
                        gs.warn("Failed to get discovery source, defaulted to ServiceNow. Error: " + e.message);
                    }

                    var ireResults = JSON.parse(SNC.IdentificationEngineScriptableApi.createOrUpdateCIEnhanced(discoverySource, JSON.stringify(irePayload), op));

                    // When done need to update the app sys_id on classified:
                    for (ai in appIndexToMatchesKey) {
                        // Find the key of matches
                        var newKey = appIndexToMatchesKey[ai];
                        // Get the correct match
                        var newMk = matches[newKey];
                        if (!classified[newMk.running_process])
                            continue;

                        // If we couldn't find the sys id - something happened. Run legacy.
                        if (!ireResults || !ireResults.items || !ireResults.items[ai] || !ireResults.items[ai].sysId)
                            return false;

                        // Find the sys id - and reconcile if needed.
                        var appSysId = reconcileClusteredApp(ireResults.items[ai].sysId);
                        if (appSysId)
                            classified[newMk.running_process].app = appSysId;
                    }
                    return sucess;
                } catch (e) {
                    gs.error("Something went wrong in ApplicationDependencyMapping.commitAppsPayload. Error=" + e);
                    return false;
                }
            }

            function reconcileClusteredApp(internalAppSysId) {
                if (JSUtil.notNil(parent_this.clusterGr)) {
                    var existingClusteredAppSysId = new ADMUtil().reconcileExistingClusteredApp(parent_this.clusterGr, internalAppSysId, mk.relation_type, parent_this.ci_sys_id + '');
                    if (existingClusteredAppSysId) {
                        internalAppSysId = existingClusteredAppSysId;

                        var clusterSysId = parent_this.clusterGr.sys_id;
                        g_disco_functions.createRelationshipIfNotExists(internalAppSysId, clusterSysId, rel_type);
                    }
                }

                return internalAppSysId;
            }

            function legacyCreateOrUpdateApp() {
                var appSysId = DiscoveryCMDBUtil.createOrUpdateApp(app_gr, host_sys_id, rel_type); //, undefined, hostClass); // add hostClass
                if (JSUtil.nil(appSysId) || appSysId === 'Unknown') {
                    DiscoveryLogger.error("Failed to insert classified application of type: " + mk.table, "ApplicationDependencyMapping", g_probe.getEccQueueId() + '');
                    delete classified[mk.running_process];
                    return;
                }

                return reconcileClusteredApp(appSysId);
            }

            // ---- INTERNAL FUNCTION END 
        }

        function cacheRunningProcesses(matches) {
            var sysIds = [];
            var cacheRp = {};
            for (var key in matches) {
                var mk = matches[key];
                sysIds.push(mk.running_process);
            }

            if (sysIds.length < 1)
                return cacheRp;

            var rpGr = new GlideRecord('cmdb_running_process');
            rpGr.addQuery('sys_id', sysIds);
            rpGr.query();
            while (rpGr.next()) {
                var sysId = rpGr.getValue('sys_id');
                cacheRp[sysId] = {};
                cacheRp[sysId].command = rpGr.getValue('command');
                cacheRp[sysId].key_parameters = rpGr.getValue('key_parameters');
            }

            return cacheRp;
        }

        function addScriptedFieldValuesToApp(app_gr, match) {
            var added = match.__app_gr;
            for (var field in added)
                app_gr[field] = added[field];
        }

        function addRunningProcessInfoToApp(app_gr, rp) {
            // PRB688054: Send hashed running process info to IE payload only if oracle DB
            if (GlideDBUtil.getPrimaryDBConfigurationParms().getRDBMS() + '' === 'oracle') {
                app_gr.rp_command_hash = SNC.DiscoveryHasher.hash('' + rp.command);
                app_gr.rp_key_parameters_hash = SNC.DiscoveryHasher.hash('' + rp.key_parameters);
            } else {
                app_gr.running_process_command = '' + rp.command;
                app_gr.running_process_key_parameters = '' + rp.key_parameters;
            }
        }

        // E N D   I N N E R   F U N C T I O N S
    },

    get_matched_java_processes: function() {
        var javaProp = gs.getProperty('glide.discovery.java_processes', "java,jdk,jre");
        var javaProcArr = javaProp.split(',');
        var rps = this.sensor.running_processes;
        var javaProcesses = [];
        for (var i = 0; i < rps.length; i++) {
            var rp = rps[i];
            var lowerCaseName = rp.name.toLowerCase();
            for (var j = 0; j < javaProcArr.length; j++) {
                var proc = javaProcArr[j];
                if (lowerCaseName.indexOf(proc) != -1) {
                    javaProcesses.push(rp);
                    break;
                }
            }
        }
        return javaProcesses;
    },

    /**
     * Returns a map, keyed by running process sys_id and correlation id (separately), of
     * orphaned app instance sys_id values.  An orphaned app instance is one whose correlation ID
     * or running process pointer indicate that it once had a relationship to this computer,
     * but for some reason it does not have one now.
     */
    get_orphaned_apps: function(matches, existing_rels) {
        // first iterate over our matches to build sets of running process sys_ids and correlation ids...
        var rpcr_ids = {};
        for (var key in matches)
            rpcr_ids[matches[key].running_process] = matches[key].cid;

        // delete all those that matched an existing relationship...
        for (var key in existing_rels)
            delete rpcr_ids[existing_rels[key].running_process];

        // build lists of running process sys_ids and correlation ids that we can query for...
        var rp_ids = [];
        var cr_ids = [];
        for (var key in rpcr_ids) {
            rp_ids.push(key);
            cr_ids.push(rpcr_ids[key]);
        }

        // query cmdb_ci_appl to see if we have any orphans, and make a result map... 
        var result = {};
        var app_gr;

        // once for running processes
        app_gr = new GlideRecord('cmdb_ci_appl');
        app_gr.addQuery('running_process', 'IN', rp_ids);
        app_gr.query();
        while (app_gr.next()) {
            if (!app_gr.running_process.nil())
                result['' + app_gr.running_process] = '' + app_gr.sys_id;
        }

        // once for correlation ids
        app_gr = new GlideRecord('cmdb_ci_appl');
        app_gr.addQuery('correlation_id', 'IN', cr_ids);
        app_gr.query();
        while (app_gr.next()) {
            if (!app_gr.correlation_id.nil())
                result['' + app_gr.correlation_id] = '' + app_gr.sys_id;
        }

        return result;
    },

    /**
     * Returns an object whose properties are named according to lookup keys, and whose values are all
     * objects containing cmdb_rel_ci record values plus some values from the related app instance.
     * There are several different kinds of lookup keys populated (one per cmdb_rel_ci record).  Note
     * that duplicates and relationships to manually-entered app instances are ignored:
     *
     * Exact match for new style classified applications:
     *   key: 'EN:' + computer.sys_id + ':' + classifier.sys_id + ':' + running_process.sys_id
     *
     * Fuzzy match for new style classified applications (used when running process changed):
     *   key: 'FN:' + computer.sys_id + ':' + classifier.sys_id
     *
     * Exact match for old style classified applications:
     *   key  'EO:' + correlation ID
     * Match no classifier (NC) applications ( PRB1198119: When ServiceMapping creates application without classifier) :
     *   key: 'NC:' + computer.sys_id + ':' + running_process.sys_id 
     */
    get_existing_relationships: function() {
        //First determine which appl tables we care about for ADM,
        // namely those tables which we populate via process classification

        var appTableList = [];
        var ga = new GlideAggregate("discovery_classy_proc");
        ga.groupBy("table");
        ga.query();
        while (ga.next())
            appTableList.push(ga.table + '');

        //Now find all the apps which have a relationship with this computer CI
        var result = {};
        var rgr = new GlideRecord('cmdb_rel_ci');

        if (JSUtil.notNil(this.clusterGr))
            rgr.addQuery('child', [this.ci_sys_id, this.clusterGr.sys_id]); // IF it's a cluster, then look for the apps associated with it as well
        else
            rgr.addQuery('child', this.ci_sys_id);

        rgr.addQuery('parent.sys_class_name', appTableList);
        rgr.query();
        while (rgr.next()) {
            var er = {};
            er.sys_id = '' + rgr.sys_id;
            er.parent = '' + rgr.parent;
            er.child = '' + rgr.child;
            er.type = '' + rgr.type;
            er.cid = '' + rgr.parent.correlation_id;
            er.classifier = '' + rgr.parent.classifier;
            er.running_process = '' + rgr.parent.running_process;

            // make the right keys...
            if (er.classifier) {
                if (er.running_process)
                    result['EN:' + er.child + ':' + er.classifier + ':' + er.running_process] = er;
                else
                    result['FN:' + er.child + ':' + er.classifier] = er;
            } else if (er.cid) {
                var cid = er.cid;
                // Just because there's a correlation id, it doesn't mean it is the old format. The format we want to check for is
                // something like checksum@sys_id (ex: 342452354@9e63a3d7ef03010098d5925495c0fb50)
                var position = cid.indexOf("@"); //should have an @ sign
                if (position <= 0)
                    continue;

                if (!cid.substring(0, position).match(/^[0-9]+$/)) //if not all number, since checksum is all numbers
                    continue;

                result['EO:' + er.cid] = er;
            } else if (er.running_process) {
                result['NC:' + er.child + ':' + er.running_process] = er;
            }
        }

        return result;
    },

    /**
     * Checks if we have a process classification match for running processes that we find.
     * Stores all the running processes that have a classifier match in matched_processes.
     */
    get_matches: function() {
        // will hold all the matches we find...
        var matches = [];
        // load up all our process classifiers...
        var classifiers = this.get_classifiers();
        // get a combined filter from all our classifiers
        var combined_filter = this.get_combined_filter(classifiers);

        // iterate over all our running processes to classify them...
        var rp_gr = new GlideRecord('cmdb_running_process');
        var rps = this.sensor.running_processes;

        for (var i = 0; i < rps.length; i++) {
            var rp = rps[i];

            // PRB636183: need to add the computer field to running process before process classification
            // prior to Fuji, this was already done in RunningProcessReconciler..
            rp.computer = this.sensor.getCmdbCi();

            // if we're not supposed to classify this process, well, then, DON'T...
            if (JSUtil.notNil(rp.classify) && ('' + rp.classify) != 'true')
                continue;

            // make a fake GlideRecord...
            rp_gr.initialize();
            for (var field in rp)
                rp_gr[field] = rp[field];

            // if none of our filters match, then don't check individual process classifiers..
            if (!this.sensor.accAgentId && JSUtil.notNil(combined_filter) && !combined_filter.match(rp_gr, true))
                continue;

            // see if any of our conditions match...
            for (var j = 0; j < classifiers.length; j++) {
                var classifier = classifiers[j];

                // if this classifier only checks parameters, and we don't have any then just skip it..
                if (JSUtil.nil(rp_gr['parameters']) && classifier.is_param_only)
                    continue;

                if (classifier.filter && classifier.filter.match(rp_gr, true)) {
                    rp.classifier = classifier;
                    matches.push(rp);
                    break;
                }
            }
        }
        return matches;
    },

    /**
     * Returns an object whose properties are named according to lookup keys, and whose values are all
     * objects containing information from the matching classifier and from the running process record
     * that matched in get_matches() (above).  There are four different kinds of lookup keys populated
     * for each classifier match:
     *
     * Exact match for new style classified applications:
     *   key: 'EN:' + computer.sys_id + ':' + classifier.sys_id + ':' + running_process.sys_id
     *
     * Fuzzy match for new style classified applications (used when running process changed):
     *   key: 'FN:' + computer.sys_id + ':' + classifier.sys_id
     *
     * Exact match for old style classified applications:
     *   key  'EO:' + correlation ID
     *
     * Match no classifier (NC) applications ( PRB1198119: When ServiceMapping creates application without classifier) :
     *   key: 'NC:' + computer.sys_id + ':' + running_process.sys_id
     */
    save_matches: function() {
        // will hold all the matches we find...
        var matches = {};

        for (var i = 0; i < this.matched_processes.length; i++) {
            var rp = this.matched_processes[i];

            // if sys_id is null, then this is a forked process (deleted in EnrichProcessesAndConnections), so skip it
            if (JSUtil.nil(rp.sys_id))
                continue;

            // make a fake GlideRecord...
            var rp_gr = new GlideRecord('cmdb_running_process');
            rp_gr.initialize();
            for (var field in rp)
                rp_gr[field] = rp[field];

            this.matched(matches, rp_gr, rp_gr.classifier);
        }
        return matches;
    },

    /**
     * Adds records as maps of information to each of the three keys described in save_matches() (above) to the
     *  given matches object for a match between the given classifier and the given running process.
     */
    matched: function(matches, rp_gr, classifier) {
        var match = {};

        // clone the classifier...
        for (var prop in classifier)
            match[prop] = classifier[prop];

        // capture everything we need from the process record...
        match.running_process = '' + rp_gr.sys_id;
        match.pid = '' + rp_gr.pid;
        match.computer = '' + rp_gr.computer;
        match.parent = '' + rp_gr.parent;
        match.cid = new GlideChecksum('' + rp_gr.command + ' ' + rp_gr.key_parameters).get() + '@' + rp_gr.computer;

        // run the "On classification" script now, as may add some data to our match...
        this.runOnClassificationScript(match);

        // make our four keys and stuff our value into each...
        matches['EN:' + match.computer + ':' + match.sys_id + ':' + match.running_process] = match;
        matches['FN:' + match.computer + ':' + match.sys_id] = match;
        matches['EO:' + match.cid] = match;
        matches['NC:' + match.computer + ':' + match.running_process] = match;
    },

    /**
     * Run the "On classification" script for the given match.  Changes to the application instance record made by
     * the script are added to the __app_gr property as a name/value map.
     */
    runOnClassificationScript: function(match) {
        this.putScriptGlobals(match);

        // now run the script...
        eval(match.script);

        // stuff any changed values for the application instance into the __app_gr property...
        match.__app_gr = current;

        // stuff any parametes to be passed on through g_probe_parameters by keeping track of the process
        this.paramsToPass[match.running_process] = g_probe_parameters;
    },

    /**
     * Puts the necessary global values into the script environment.
     */
    putScriptGlobals: function(match) {
        //Exposing deviceGR because some process classification scripts have come to expect it.
        this.sensor['deviceGR'] = this.sensor.getCmdbRecord();

        var proc = this.procByID[match.running_process];

        // put the expected global variables in place...
        current = {};
        type = this.getOSType();
        classifier_name = match.name;

        if (proc) {
            name = proc.name;
            command = proc.command;
            parameters = proc.key_parameters;
        }

        // Exposing the process object itself
        g_process = proc;
        // Exposing the process classifier GlideRecord
        g_classification = match;
        // Exposing the parameter for passing parameters through
        g_probe_parameters = {};

        //Expose values as a Java hashmap for historical reasons...
        values = new Packages.java.util.HashMap();
        for (var i in proc)
            values.put(i, proc[i]);

        values.put("type", type);
    },

    /**
     * Launch any probes needed.
     */
    launchProbes: function(classified) {
        for (var rp in classified) {
            var match = classified[rp];

            // get the probes we need to trigger; bail out if there weren't any...
            var probes = this.getTriggeredProbes(match);
            if (!probes)
                continue;

            // we have at least one probe to launch, so gather the bits of information we'll need to do it...
            var source = '' + this.sensor.getParameter('source');
            var cmdb_ci = '' + match.app;
            var classifier = match.classifier;
            var proc = this.procByID[match.running_process];
            var agent = '' + this.sensor.getAgent();
            var ecc_id = '' + this.sensor.getEccQueueId();
            var port = '' + this.sensor.getParameter('port');
            var priority = this.sensor.getParameter('priority');
            var mid_selector_details = this.sensor.getParameter('mid_selector_details');
            var ssmObject = this.sensor.getParameter('ssm_object');
            
            // now iterate over our probe records, launching them...
            while (probes.next()) {
                var probe = new SncProbe(probes, proc);
                probe.setSource(source);
                probe.addParameter('classifier', classifier);
                probe.addParameter('cmdb_ci', cmdb_ci);
                probe.addParameter('os_type', this.getOSType());

                if (port)
                    probe.addParameter('port', port);
                if (priority)
                    probe.setEccPriority(priority);
                if (ssmObject)
                    probe.addParameter('ssm_object', ssmObject);
                
                if (mid_selector_details)
                    probe.setMidSelectDetails(mid_selector_details);

                // Adding addition parameters from g_probe_parameter
                this._addProbeParameters(probe, match);
                probe.create(agent, ecc_id);
            }
        }
    },

    /**
     * Returns a GlideRecord instance of the probes to be triggered for the given classifier ID, or null if there are none.
     */
    getTriggeredProbes: function(match) {
        // temporarily expose any probe parameters passed from on classification script of process classifier
        var probe_parm = g_probe_parameters; // save it
        g_probe_parameters = this.paramsToPass[match.running_process];

        // first, figure out which probes, if any, we need to launch...
        var probe_ids = [];

        var dcp = DiscoveryFunctions.getClassifierProbes(match.classifier, true);
        for (i in dcp) {
            var item = dcp[i];
            if (this.triggerCondition(item))
                probe_ids.push('' + item.child);
        }

        g_probe_parameters = probe_parm; // restore it

        // get out of dodge if there are no probes needed...
        if (probe_ids.length == 0)
            return null;

        // now get a glide record with just these probes in it...
        var rgr = new GlideRecord('discovery_probes');
        rgr.addQuery('sys_id', probe_ids);
        rgr.query();
        return rgr;
    },

    /**
     * Evaluates the trigger condition on the given discovery_classifier_probe record and returns with the boolean result.
     */
    triggerCondition: function(triggerGR) {
        if (!triggerGR.condition_script)
            return true;

        var conditionScript = '' + triggerGR.condition_script;

        if (!conditionScript)
            return true;

        return eval('!!(' + conditionScript + '\n)');
    },

    /*
     * Adding additional probe parameters from g_probe_parameters, which is stored in the paramsToPass variable
     */
    _addProbeParameters: function(probe, match) {
        var parameters = this.paramsToPass[match.running_process];
        for (var param in parameters)
            probe.addParameter(param, parameters[param]);
    },


    /**
     * Returns the operating system type (windows, unix, or esx) based on the CI's type...
     */
    getOSType: function() {
        var ci_class = '' + this.sensor.getCmdbRecord().sys_class_name;

        if (ci_class == 'cmdb_ci_esx_server')
            return 'esx';

        if (ci_class.indexOf('win_server') >= 0)
            return 'windows';

        if (ci_class == 'cmdb_ci_computer') {
            var os = this.sensor.getCmdbRecord().os;

            if (os.indexOf("Windows") >= 0)
                return 'windows';
        }

        return 'unix';
    },

    /**
     * Returns an array of all our process classifiers (as objects), in order.  Also populates this.classifierByID with
     * a map (by sys_id) of all our classifiers.
     */
    get_classifiers: function() {
        // load up all our process classifiers...
        this.classifierByID = {};
        var classifiers = [];
        var pc = this.getAllProcessClassifiers();
        for (var pcKey in pc) {
            var item = pc[pcKey];
            var classifier = {};
            classifier.name = '' + item.name;
            classifier.condition = '' + item.condition;
            classifier.table = '' + item.table;
            classifier.script = '' + item.script;
            classifier.match_criteria = '' + item.match_criteria;
            classifier.relation_type = '' + item.relation_type;
            classifier.sys_id = '' + item.sys_id;
            classifier.is_param_only = this.is_parameters_classifier(classifier);

            //For efficiency, instantiate a "filter" object for checking the classifier conditions:
            if (classifier.condition)
                classifier.filter = new SNC.Filter(classifier.condition, "rule-condition");

            classifiers.push(classifier);
            this.classifierByID[classifier.sys_id] = classifier;
        }

        return classifiers;
    },

    getAllProcessClassifiers: function() {
        // Get all records for this query
        return DiscoveryFunctions.getAllRecordsForTable('discovery_classy_proc', 'sys_id', this.getEncodedQueryForClassifiers());
    },

    getEncodedQueryForClassifiers: function() {
        var encodedQuery = 'active=true';
        if (gs.getProperty('glide.discovery.auto_adm', 'false') == 'false') //If auto_adm is not enabled, then don't get the pending classifiers
            encodedQuery += '^nameNOT LIKEPending:';
        encodedQuery += '^ORDERBYorder'; // Add order by

        return encodedQuery;
    },

    /**
     * Check if this classifier is a parameters only classifier.
     * Returns true if parameters are required for this classifier.
     */
    is_parameters_classifier: function(classifier) {
        var conditions = classifier.condition.split(/\^EQ|\^NQ|\^OR|\^/);
        for (var i = 0; i < conditions.length; i++) {
            if (conditions[i] != '' && !conditions[i].startsWith("parameters"))
                return false;
        }
        return true;
    },

    /**
     * Combine all the process classifiers into one aggregate condition.
     * Returns a filter that checks if any of our classifiers match.
     */
    get_combined_filter: function(classifiers) {
        if (gs.getProperty('glide.discovery.auto_adm', 'false') == 'true')
            return null;

        var combined = "";
        for (var i = 0; i < classifiers.length; i++) {
            var classifier = classifiers[i];
            combined += classifier.condition.slice(0, classifier.condition.length - 3) + "^NQ";
        }
        combined = combined.slice(0, combined.length - 3) + "^EQ";
        return new SNC.Filter(combined, "rule-condition");
    },

    /*
     * Checks if pattern execution is enabled on agent & if a valid accAgentId exists
     * Returns true/false
     */
    isPatternExecutionEnabledOnAgent: function(accAgentId) {
        return (gs.getProperty('sn_agent.appl_classification_behavior', 'simple') == 'full' && accAgentId);
    },

    /*
     * Creates a probe to launch application patterns on a given agent
     * Returns the output ID of the probe created
     */
    createPatternProbeForAgent: function(targetAgent, match, procByID, probes) {
        var agentId = '' + targetAgent.agentId; //accAgentId
        var classifier = match.classifier;
        var cmdbCi = '' + match.app;
        var osType = '' + targetAgent.osType;
        var mid = '' + targetAgent.midServerName;
        var mid_selector_details = "{\"mode\":\"specific_mid\"}";
        var proc = procByID;
        var source = '' + targetAgent.ipAddress;
        var ecc_id;
        // ecc_queue object is a global variable defined in this specific thread that has its own context
        if (typeof ecc_queue != 'undefined' && ecc_queue)
            ecc_id = '' + ecc_queue.sys_id;
        // now iterate over our probe records, launching them...
        while (probes.next()) {
            var probe = new SncProbe(probes, proc);
            probe.setSource(source);
            probe.addParameter('agent_id', agentId); // for ACC-F
            probe.addParameter('classifier', classifier);
            probe.addParameter('cmdb_ci', cmdbCi);
            probe.addParameter('os_type', osType);
            probe.setMidSelectDetails(mid_selector_details);

            // Adding addition parameters from g_probe_parameter
            this._addProbeParameters(probe, match);
            if (ecc_id)
                probe.create(mid, ecc_id);
            else
                probe.create(mid);
        }
    },

    getPattern: function(patternSysId) {
        var patternGr = new GlideRecord('sa_pattern');
        if (patternGr.get(patternSysId))
            return patternGr;
        return null;
    },

    launchJavaPattern: function(javaProcesses, accAgentId) {
        var HORIZANTAL_PATTERN_PROBE = "4f64c6389f230200fe2ab0aec32e7068";
        var JAVA_INSTALLATION_PATTERN = "594e983dc3a8161055fcb4fdd4013158";
        var pattern = this.getPattern(JAVA_INSTALLATION_PATTERN);
        if (pattern == null || !pattern.active) {
            gs.error("Java Installation Pattern record either not found or inactive, skipping the Java Pattern Execution.");
            throw "Java Installation Pattern with sys_id " + JAVA_INSTALLATION_PATTERN + " is either not found or inactive";
        }
        for (var i = 0; i < javaProcesses.length; i++) {
            var rp = javaProcesses[i];
            var rgr = new GlideRecord('discovery_probes');
            rgr.addQuery('sys_id', HORIZANTAL_PATTERN_PROBE);
            rgr.query();
            if (rgr.next()) {
                var proc = rp;
                var agentId, os_type, mid, mid_selector_details, source, ecc_id, port, priority;
                if (accAgentId) {
                    var targetAgent = this.getTargetAgentDetails(accAgentId);
                    agentId = accAgentId;
                    os_type = targetAgent.osType + '';
                    mid = targetAgent.midServerName + '';
                    mid_selector_details = "{\"mode\":\"specific_mid\"}";
                    source = targetAgent.ipAddress + '';
                } else {
                    source = this.sensor.getParameter('source') + '';
                    mid = this.sensor.getAgent() + '';
                    ecc_id = this.sensor.getEccQueueId() + '';
                    port = this.sensor.getParameter('port') + '';
                    priority = this.sensor.getParameter('priority');
                    mid_selector_details = this.sensor.getParameter('mid_selector_details');
                    os_type = this.getOSType() + '';
                }

                var probe = new SncProbe(rgr, proc);
                probe.setSource(source);
                probe.addParameter('os_type', os_type);
                if (accAgentId)
                    probe.addParameter('agent_id', agentId); // for ACC-F
                if (port)
                    probe.addParameter('port', port);
                if (priority)
                    probe.setEccPriority(priority);
                if (mid_selector_details)
                    probe.setMidSelectDetails(mid_selector_details);

                //---java pattern details---
                probe.addParameter('pattern_type', '1');
                probe.addParameter('patternId', JAVA_INSTALLATION_PATTERN);
                probe.addParameter('pattern', pattern.getValue('name') + '');
                probe.addParameter('used_by_discovery', 'true');

                var prePatternExecutionData = {};
                prePatternExecutionData.fMapOfStrings = {
                    "isAgent": (accAgentId != null)
                };
                prePatternExecutionData.className = "PrePatternExecutionDTO";
                probe.addParameter('prePatternExecutionData', JSON.stringify(prePatternExecutionData));
                //--- end java pattern details---

                if (accAgentId)
                    probe.create(mid);
                else
                    probe.create(mid, ecc_id);
            }
        }
    },

    getTargetAgentDetails: function(agentId) {
        var targetAgent = {};
        var agentGr = new GlideRecord("sn_agent_ci_extended_info");
        agentGr.addQuery("agent_id", agentId);
        agentGr.query();
        if (agentGr.next()) {
            targetAgent.agentId = agentId;
            targetAgent.ipAddress = agentGr.getValue('ip_address');
            targetAgent.midServerName = getMidServerName(agentGr.getValue('mid'));
            targetAgent.osType = type;
        }
        return targetAgent;

        function getMidServerName(midSysId) {
            var midGr = new GlideRecord('ecc_agent');
            if (midGr.get('sys_id', midSysId)) {
                return midGr.name;
            }
            return "";
        }
    },

    type: 'ApplicationDependencyMapping'
};
