new DiscoveryWindowsClusterBaseSensor({
    process: function(result) {
		this.initVars();
		this.parseResult(result);
    },

	initVars: function() {
		// init variables used in this class
		this.activeNodes    = {};		
		this.hostRelType    =  null;
		this.hostIPs        = [];
		this.hostRelTypeStr = 'Hosted on::Hosts';
		this.clusterRelTypeStr = 'Cluster of::Cluster';
		this.clusterMemRelTypeStr = 'Members::Member of';
	},
	
    parseResult: function(result) {
        this.findClusters(result);
        this.findNodes(result);
        this.findResources(result);
		this.findActiveNodes(result);
        this.associateClustersToNodes(result);
        this.associateClustersToResources(result);
        this.associateResourcesToNodes(result);
		this.getHostIPs(result);
        this.processClusters();
    },

    processClusters: function() {
        // remember our current stuff...
        var serverGR = this.getCmdbRecord();
        var serverCur = current;

        if (!this.clusters) 
            return;

        // iterate through all the clusters...
        for (var clusterName in this.clusters) {
            var cluster = this.clusters[clusterName];

            // switch current context to the cluster...
            var lock = new GlideRecordLock('cmdb_ci_win_cluster', cluster.name);
            lock.setSpinWait(50);
            if (!lock.get())
                continue;
            try {
                var clusterGR = this.findOrCreateCluster(clusterName);
                var clusterRelatedListDataObj = {};
                this.addToClusterRelatedList(clusterRelatedListDataObj, 'cmdb_ci_cluster_vip', cluster['cmdb_ci_cluster_vip'], 'cluster', 'ip_address');
                this.addToClusterRelatedList(clusterRelatedListDataObj, 'cmdb_ci_win_cluster_resource', cluster['cmdb_ci_win_cluster_resource'], 'cluster', 'name');

                var nodes = this._format_cluster_node_name(cluster['cmdb_ci_win_cluster_node']);
                this.addToClusterRelatedList(clusterRelatedListDataObj, 'cmdb_ci_win_cluster_node', nodes, 'cluster', 'name');

                this.updateCluster(cluster, clusterGR, clusterRelatedListDataObj);

                this.updateVIPHost(serverGR, clusterGR, cluster);

            } finally {
                lock.release();
            }
        }
    },

    addToClusterRelatedList: function(clusterRelatedListDataObj, tableName, dataArray, refName, keyName, deleteGr) {
        clusterRelatedListDataObj[tableName] = {
            data: dataArray,
            refName: refName,
            keyName: keyName,
            deleteGr: false
        };
    },
	
    updateCluster: function(data, clusterGR, clusterRelatedListDataObj) {
        if (gs.nil(clusterGR))
            return;

        for (var fieldName in data) {
            var value = data[fieldName];
            if (JSUtil.notNil(value)) {
                // PRB632583: Use setValue() here instead of gr[fieldName] = value
                // GlideRecord returns times in UTC and setValue() accepts
                // dates in UTC, but assignment uses the current timezone.
                clusterGR.setValue(fieldName, value);
            }
        }
        clusterGR.update();
        new DiscoveryReconciler(clusterGR, clusterRelatedListDataObj).process();	
    },
	
    _format_cluster_node_name: function(nodes) {
        var hn = new HostnameJS(); 
		
        for (var i=0; i < nodes.length; i++) {
            var name = nodes[i].name;
            hn.format(name);		
            nodes[i].name =  hn.getFQDN();					
        }
		
        return nodes;
    },
	
    /*
     * This method is invoked after all clusters have been processed AND saved to the database.
     */
    after: function() {
        for (var clusterName in this.clusters) {
            var cluster = this.clusters[clusterName];
            var lock = new GlideRecordLock('cmdb_ci_win_cluster', cluster.name + ":after");
            lock.setSpinWait(50);
            if (!lock.get())
                continue;
            try {
                this.updateSysIDs(cluster);
                this.reconcileResourcesToNodes(cluster);
				this.createRelationships(cluster);
            } finally {
                lock.release();
            }
        }
    },

	findActiveNodes: function(result) {      				
		var n2gEntries = g_array_util.ensureArray(result.MSCluster_NodeToActiveGroup);
        var source = this.primStr(this.getSource());
        for (var i = 0; i < n2gEntries.length; i++) {
            var n2gEntry = n2gEntries[i];

            var grp = this.getPropValue( 'MSCluster_Node.Name',  n2gEntry.GroupComponent ).toUpperCase();
            var prt = this.getPropValue( 'MSCluster_ResourceGroup.Name', n2gEntry.PartComponent  );
			
			// If taking about cluster group
			if (prt.toUpperCase() == 'CLUSTER GROUP')
				this.activeNodes[grp] = true;
		}
    },
	
	createRelationships: function(cluster) {        
	
		// Create cluster node to host relationships and cluster to active node relationship
		// Assumption that relationship will be deleted when and if cluster node ever leaves cluster		
		var discoveryFunctions = new DiscoveryFunctions();
		for (var i = 0; i < cluster.cmdb_ci_win_cluster_node.length; i++) {

            // First create cluster node to host relationship
            var node = cluster.cmdb_ci_win_cluster_node[i];
            discoveryFunctions.createRelationshipFromSysIds(node.sys_id, node.server, this.hostRelTypeStr);		
			// cluster node to cluster relationship (note that there is also a reference for this)
			discoveryFunctions.createRelationshipFromSysIds(node.sys_id, cluster.sys_id, this.clusterRelTypeStr);
			discoveryFunctions.createRelationshipFromSysIds(cluster.sys_id, node.sys_id,  this.clusterMemRelTypeStr);
		
			// If this is an active node then create a relationship with cluster
			if (node.name.toUpperCase() in this.activeNodes) {
								
				if (!this.hostRelType)
					this.hostRelType = discoveryFunctions.findCIRelationshipType('cmdb_rel_type', this.hostRelTypeStr);
			
				// Create relationship if none exists
				// If there is an another active node for this cluster, then delete it and create relationship
				var gr = new GlideRecord('cmdb_rel_ci');
				gr.query('parent', cluster.sys_id);
				gr.query('type', this.hostRelType);
				gr.query();
								
				if (!gr.next()) 
					discoveryFunctions.createRelationshipFromSysIds(cluster.sys_id, node.server, this.hostRelTypeStr);
				else if (gr.getValue('child') != node.server) {
					gr.deleteRecord();
					discoveryFunctions.createRelationshipFromSysIds(cluster.sys_id, node.server, this.hostRelTypeStr);
				}
			}
		}
    },
	
    reconcileResourcesToNodes: function(cluster) {
        var rnPairs = this.getDiscoveredResourceNodePairs(cluster);
        var rnpGR = this.getCurrentResourceNodePairs(cluster);
        this.deleteOrUpdateDatabase(rnPairs, rnpGR);
        this.insertNewResourceNodePairs(rnPairs, rnpGR);
    },

    insertNewResourceNodePairs: function(rnPairs, rnpGR) {
        // now add any pairs we are supposed to have, but didn't...
        for (var rnpKey in rnPairs) {
            var rnPair = rnPairs[rnpKey];
            rnpGR.initialize();
            rnpGR.cluster_node = rnPair.node.sys_id;
            rnpGR.cluster_resource = rnPair.resource.sys_id;
            rnpGR.insert();
        }
    },

    deleteOrUpdateDatabase: function(rnPairs, rnpGR) {
        // walk through the query results, reconciling against the resource/node pairs we're supposed to have...
        while (rnpGR.next()) {
            var resourceRef = this.primStr(rnpGR.cluster_resource);
            var nodeRef = this.primStr(rnpGR.cluster_node);
            var rnpKey = resourceRef + '.' + nodeRef;

            // are we supposed to have this one?
            if (rnPairs[rnpKey])
                delete rnPairs[rnpKey];
            else
                rnpGR.deleteRecord();
        }
    },

    getCurrentResourceNodePairs: function(cluster) {
        // query to see what resource/node pairs we have in the database...
        var rnpGR = new GlideRecord('cmdb_ci_cluster_node_resource');
        var qc = rnpGR.addQuery('cluster_node', 'IN', this.getNodeSysIDs(cluster));
        qc.addOrCondition('cluster_resource', 'IN', this.getResourceSysIDs(cluster));
        rnpGR.query();

        return rnpGR;
    },

    getDiscoveredResourceNodePairs: function(cluster) {
        var rnPairs = {};
        for (var i = 0; i < cluster.cmdb_ci_win_cluster_resource.length; i++) {
            var resource = cluster.cmdb_ci_win_cluster_resource[i];
            var rsrcDatum = this.rsrcData[resource.name];
            for (var n = 0; n < rsrcDatum._nodes.length; n++) {
                var node = rsrcDatum._nodes[n];
                var rnPair = {};
                rnPair['resource'] = resource;
                rnPair['node'] = node;
                if (resource.sys_id && node.sys_id)
                    rnPairs[resource.sys_id + '.' + node.sys_id] = rnPair;
            }
        }

        return rnPairs;
    },

    getNodeSysIDs: function(cluster) {
        var result = new Packages.java.util.ArrayList();
        for (var i = 0; i < cluster.cmdb_ci_win_cluster_node.length; i++) {
            var node = cluster.cmdb_ci_win_cluster_node[i];
            if (node.sys_id)
                result.add(node.sys_id);
        }

        return result;
    },

    getResourceSysIDs: function(cluster) {
        var result = new Packages.java.util.ArrayList();
        for (var i = 0; i < cluster.cmdb_ci_win_cluster_resource.length; i++) {
            var resource = cluster.cmdb_ci_win_cluster_resource[i];
            if (resource.sys_id)
                result.add(resource.sys_id);
        }
        return result;
    },

    updateSysIDs: function(cluster) {
        var clusterGR = new GlideRecord('cmdb_ci_win_cluster');
        if (!clusterGR.get('name', cluster.name))
            return;

        cluster['sys_id'] = this.primStr(clusterGR.sys_id);

        this.updateRelatedSysID('cmdb_ci_win_cluster_node',     cluster);
        this.updateRelatedSysID('cmdb_ci_win_cluster_resource', cluster);
    },

    updateRelatedSysID: function(tableName, cluster) {
        for (var i = 0; i < cluster[tableName].length; i++) {
            var item = cluster[tableName][i];
            item['sys_id'] = null;

            var itemGR = new GlideRecord(tableName);
            itemGR.addQuery('name', item.name);
            itemGR.addQuery('cluster', cluster.sys_id);
            itemGR.query();
            if (itemGR.next())
                item['sys_id'] = this.primStr(itemGR.sys_id);
        }
    },
	
	getHostIPs: function(result){
		// Collect all ip addresses corresponding to the discovered server
		var network_confs = g_array_util.ensureArray(result.Win32_NetworkAdapterConfiguration);
		for (var i = 0; i < network_confs.length; i++) {
			var nc = network_confs[i];
			if (JSUtil.nil(nc.IPAddress) || !nc.IPEnabled)
				continue;
			
			var ipParsed = nc.IPAddress.split(",");
			for (var j = 0; j < ipParsed.length; j++)
				this.hostIPs.push(ipParsed[j]);
		}
		
		
	},
	
	updateVIPHost: function(serverGr, clusterGr, cluster){
		// Populate host field in the "cmdb_ci_cluster_vip" table. For any vip in this table host is the cluster node responsible for that vip. 
		var nodeGr = new GlideRecord('cmdb_ci_cluster_node');
		nodeGr.addQuery('server', serverGr.getValue('sys_id') + '');
		nodeGr.addQuery('cluster', clusterGr.getValue('sys_id') + '');
		nodeGr.query();
		if (!nodeGr.next())
			return;
		
		var vipGr = new GlideRecord('cmdb_ci_cluster_vip');
		vipGr.addQuery('ip_address', 'IN', this.hostIPs);
		vipGr.addQuery('cluster', clusterGr.getValue('sys_id') + '');
		vipGr.query();
		while (vipGr.next()){
			vipGr.setValue('node', nodeGr.getValue('sys_id') + '');
			vipGr.update();
		}
	},
    type: "DiscoverySensor"
});
