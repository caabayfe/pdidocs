var DiscoveryRunningProcessSensor = Class.create();

DiscoveryRunningProcessSensor.prototype = Object.extendsObject(DiscoverySensor, {
    process: function(result) {
        this.deviceGR = null;
        this.discoveredEntries = {};

        this.deviceGR = this.getCmdbRecord();
        if (gs.nil(this.deviceGR))
            return;

        var procs = this.mapProcesses(result);

        if (this.newADM()) {
            this.defaultKeyParameters(procs);
            this.runHandlers(procs);
            this.addToRelatedList('cmdb_running_process', procs, 'computer', 'command,key_parameters');
            return;
        }

        this.addToRelatedList('cmdb_running_process', procs, 'computer', 'command,parameters');

        var classificationMap = DiscoveryClassification.loadClassifications("discovery_classy_proc");
        for (var i = 0; i < procs.length; i++) {
            var proc = procs[i];
            var fc = new DiscoveryClassification(this.getEccQueueRecord(), classificationMap);
            if (fc.find("discovery_classy_proc", proc)) {
                var classyName = '' + fc.getClassificationRecord().getValue('name');

                if (gs.getProperty('glide.discovery.debug.classification') == 'true')
                    gs.log("*********** The process is classified as " + classyName + " *******************" );             

                this.addDiscovered(fc);
            }
        }

        this.processDiscovered();
    },
    
    /**
     * Child classes must override this (and return true) if they implement new-style ADM.
     */
    newADM: function() {
        return false;
    },
    
    /**
     * Runs the handlers that are enabled for running in the sensor, mainly to set key_parameters.
     */
    runHandlers: function(procs) {
        // get a list of all our handlers, in name order...
        var handlers = [];
        var gr = new GlideRecord('discovery_proc_handler');
        gr.addActiveQuery();
        gr.addQuery('rps', true);
        gr.orderBy('name');
        gr.query();
        while (gr.next()) {
            var handler = {};
            handler.condition = '' + gr.condition;
            handler.classify  = ('true' == '' + gr.classify);
            handler.script    = '' + gr.script;
            handlers.push(handler);
        }
 
        // for each running process...
        var rp_gr = new GlideRecord('cmdb_running_process');
        for (var p = 0; p < procs.length; p++) {
            // make a fake GlideRecord...
            var proc = procs[p];
            rp_gr.initialize();
            for (var field in proc)
                rp_gr[field] = proc[field];
            
            // run our handlers against our fake record...
            for (var i = 0; i < handlers.length; i++) {
                var handler = handlers[i];
                if (handler.condition && SNC.Filter.checkRecord(rp_gr, handler.condition)) {
                    // update the classify setting...
                    rp_gr.setValue('classify', handler.classify);
                    
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
                    proc.classify       = '' + rp_gr.classify;
                    proc.listening_on   = '' + rp_gr.listening_on;
                    proc.connecting_to  = '' + rp_gr.connecting_to;
                }
            }
        }
    },
    
    /**
     * Default the key_parameters field to parameters
     */
    defaultKeyParameters: function(procs) {
        for (var i = 0; i < procs.length; i++)
            procs[i].key_parameters = procs[i].parameters;
    },
        
    
    // everything below here is old-style classification...

    mapProcesses: function(result) {
        // this function should be overwritten by classes extending this object
        return [];
    },

    after: function() {
        // Rewire clustered processes
        new DiscoveryClusteredProcessHelper().process(this.deviceGR);

    },

    processDiscovered: function() {
        for (var uniqId in this.discoveredEntries) {
            var cp = this.discoveredEntries[uniqId];
            this.debug("Matched process from classification: " + cp.getName() + " " + cp.getCommand());
            var sys_id = this.insertOrUpdate(cp);
            if (JSUtil.nil(sys_id))
                return;

            var dc = cp.getClassification();
            if (dc != null)
                dc.triggerProbesWithCIAndPort(sys_id, this.getParameter("port"));
        }
    },

    addDiscovered: function(fc) {
        var cp = new SncClassifiedProcess(fc);

        if (gs.nil(cp.getCommand()) && gs.nil(cp.getParameters())) {
            this.handleError(['Insufficient information to classify process: ' + cp.getName()]);
            return;
        }

        if (this.discoveredEntries[cp.getUniqueId()]) {
            var originalProcess = this.discoveredEntries[cp.getUniqueId()];
            originalProcess.addSimilarProcess(cp);
            return;
        }

        this.discoveredEntries[cp.getUniqueId()] = cp;
    },

    insertOrUpdate: function(classifiedProcess) {
        var correlationId = classifiedProcess.getUniqueId() + "@" + this.getCmdbCi();
        var processAppMatch = new DiscoveryProcessAppMatch(classifiedProcess, this.deviceGR);
        var gr = processAppMatch.match();
        if (gr.next())
            this.updateCiProcess(gr, correlationId, classifiedProcess);
        else
            gr = this.insertCiProcess(correlationId, classifiedProcess);

        return gr.sys_id;
    },

    insertCiProcess: function(correlationId, classifiedProcess) {
        var ci = new GlideRecord(classifiedProcess.getClassifiedTableName());
        ci.name = classifiedProcess.getName() + "@" + this.deviceGR.name;
        ci.correlation_id = correlationId;
        ci.pid = classifiedProcess.getValue("pid");

        this.setFields(ci, classifiedProcess.getSetFields());

        if (ci.isActionAborted())
            return;

        ci.insert();

        //Insert the pids into the PID table
        var pids = classifiedProcess.getValue("pids");
        g_disco_functions.insertPIDs(pids, ci.getUniqueValue(), this.deviceGR.getUniqueValue());

        // create a cmdb_rel_ci -- make the relationship
        var relID = g_disco_functions.createRelationship(ci, this.deviceGR, classifiedProcess.getClassifiedType());
        
        g_device.log("Created process application " + this._buildURL(ci.getDisplayValue(), ci.sys_class_name, ci.sys_id) + " (" + ci.getTableName() + ") and its " + this._buildURL("relationship", "cmdb_rel_ci", relID) + " (" + classifiedProcess.getClassifiedType()+ ")  to " + this._buildURL(this.deviceGR.getDisplayValue(), this.deviceGR.sys_class_name, this.deviceGR.sys_id), this.getSensorName(), this.getEccQueueId());
        
        return ci;
    },

    updateCiProcess: function(ci, correlationId, classifiedProcess) {
        ci.correlation_id = correlationId;
        ci.pid = classifiedProcess.getValue("pid");
        this.setFields(ci, classifiedProcess.getSetFields());
        ci.update();

        //Update the pids field in the PID table
        var pids = classifiedProcess.getValue("pids");
        g_disco_functions.updatePIDs(pids, ci.getUniqueValue(), this.deviceGR.getUniqueValue());

        var fieldsChanged = g_disco_functions.getFieldsThatChanged(ci);
        if (fieldsChanged.length > 0)
            g_device.log("Updated " + ci.getDisplayValue() + " fields " + fieldsChanged.join(", "), this.getSensorName(), this.getEccQueueId());

        // Verify the relationship, if somehow it's severed, recreate it! Unless, of course, it has a relationship with a parent cluster.
        if (this.isClusterable(classifiedProcess) && this.hasClusterRelationship(ci))
            return;
        
        if (JSUtil.notNil(g_disco_functions.relationshipExists(ci, this.deviceGR, classifiedProcess.getClassifiedType())))
            return;
            
        var relID = g_disco_functions.createRelationship(ci, this.deviceGR, classifiedProcess.getClassifiedType());
        var relationship = classifiedProcess.getClassifiedType();
        
        g_device.log("Recreated " + this._buildURL("relationship", "cmdb_rel_ci", relID) + " (" + relationship + ") between " + this._buildURL(ci.getDisplayValue(), ci.sys_class_name, ci.sys_id) + " (" + ci.getTableName() + ") and " + this._buildURL(this.deviceGR.getDisplayValue(), this.deviceGR.sys_class_name, this.deviceGR.sys_id), this.getSensorName(), this.getEccQueueId());
    },

    isClusterable: function(classifiedProcess) {
        var gr = new GlideRecord("discovery_classy_proc_to_param");
        gs.addNotNullQuery("parameter");
        gr.addQuery("process_classifier", classifiedProcess.getRecord().getUniqueValue());
        gr.query();
        while (gr.next())
            if (gr.parameter.type.match(/^cluster$/i))
                return true;

        return false;
    },

    hasClusterRelationship: function(ci) {
        var gr = new GlideRecord("cmdb_ci_cluster_node");
        gr.addQuery("server", this.deviceGR.sys_id);
        gr.query();
        while (gr.next()) {
            var cluster = new GlideRecord("cmdb_ci_cluster");
            // Make sure that the cluster we are a node for is real
            if (!cluster.get(gr.cluster))
                continue;

            if (g_disco_functions.relationshipExists(ci.getUniqueValue(), cluster.getUniqueValue(), "Runs on::Runs"))
                return true;
        }
        return false;
    },

    setFields: function(ci, fields) {
        if (fields == null || fields.isEmpty())
            return;

        var it = fields.keySet().iterator();
        while (it.hasNext()) {
            var key = it.next();
            var value = fields.get(key);
            if (key == "setAbortAction")
                ci.setAbortAction(value);
            else
                ci.setValue(key, value);
        }
    },

    _buildURL: function(display, table, sysID) {
        return "[code]<a title='" + display + "' class='linked' href='" + table + ".do?sysparm_query=sys_id=" + sysID + "'>" + display + "</a>[/code]";
    },

    updateDeviceCount: function() {
        if (!g_device)
            return;

        g_device.completedRunningProcesses();
    },

    type: "DiscoverySensor"
});
