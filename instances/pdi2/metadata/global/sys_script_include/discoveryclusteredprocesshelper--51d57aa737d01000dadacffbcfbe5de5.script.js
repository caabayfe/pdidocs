var DiscoveryClusteredProcessHelper = Class.create();

DiscoveryClusteredProcessHelper.prototype = {
    // If we're a member of a cluster, process classified processes that are clusterable
    process: function(deviceGR) {
        if (gs.nil(deviceGR))
            return;

        this.deviceGR = deviceGR;
        this.getCluster();
        if (gs.nil(this.cluster))
            return;

        this.getSupportedProcs();
        for (var type in this.supportedProcs) {
            this.proc = this.supportedProcs[type];
            this.processClusteredProcs();
        }
    },

    // Determine which classified processes support clustering
    getSupportedProcs: function() {
        this.supportedProcs = {};
        var clusterType = /^cluster$/i;
        var mtom = new GlideRecord("discovery_classy_proc_to_param");
        mtom.addNotNullQuery("process_classifier");
        mtom.addNotNullQuery("parameter");
        mtom.query();
        while (mtom.next())
            if (mtom.parameter.type.match(clusterType))
                // note: this dot-walks into discovery_classy_param
                eval("this.supportedProcs['" + mtom.parameter.sys_id + "'] = { grType: '" 
                        + mtom.process_classifier.table + "'," + mtom.parameter.value + "}");
    },

    // Returns the first valid cluster where this CI is a node
    getCluster: function() {
        var gr = new GlideRecord("cmdb_ci_cluster_node");
        gr.addQuery("server", this.deviceGR.sys_id);
        gr.query();
        while (gr.next()) {
            var cluster = new GlideRecord("cmdb_ci_cluster");
            if (!cluster.get(gr.cluster))
                continue;

            this.cluster = cluster;
            return;
        }
    },

    // Process any existing classified processes associated with the cluster, and newly discovered 
    // classified processes from one of the cluster nodes
    processClusteredProcs: function() {
        var classyProc = this.getClassifiedProcesses(this.deviceGR.sys_id);
        while (classyProc.next())
            this.processNew(classyProc);
    },

    // Returns all classified processes that have a "Runs on::Runs" relationship with the given child
    getClassifiedProcesses: function(child) {
        var type = new DiscoveryFunctions().findCIRelationshipType("cmdb_rel_type", "Runs on::Runs");
        var gr = new GlideRecord("cmdb_rel_ci");
        gr.addQuery("child", child);
        gr.addQuery("type", type);
        gr.query();
        return gr;
    },

    // Process a "new" classified process (note: may be merged with an existing classy proc on the cluster)
    processNew: function(classyProc) {
        var procGR = new GlideRecord(this.proc.grType);
        if (!procGR.get(classyProc.parent))
            return;

        if (!this.isClusterResource(procGR))
            return;

        var relTypeGr = new GlideRecord("cmdb_rel_type");
        var relType = relTypeGr.get(classyProc.type) ? ''+relTypeGr.sys_name : "Runs on::Runs";
        new DiscoveryFunctions().createRelationshipIfNotExists(procGR.sys_id, this.cluster.sys_id, relType);
    },

    // Checks if the provided process is a cluster resource
    isClusterResource: function(process) {
        var resource = new GlideRecord("cmdb_ci_cluster_resource");
        resource.addQuery("cluster", this.cluster.sys_id);
        resource.addQuery("resource_type", this.proc.resourceType);
        resource.query();
        while (resource.next())
            if (this.proc.isMatch(process, resource))
                return true;
    },

    type: "DiscoveryClusteredProcessHelper"
};
