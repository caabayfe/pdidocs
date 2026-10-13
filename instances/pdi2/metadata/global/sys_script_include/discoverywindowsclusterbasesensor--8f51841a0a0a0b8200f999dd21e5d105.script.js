// Discovery class

/*
 * Base class for Windows Classify and Windows Cluster sensors.
 */

var DiscoveryWindowsClusterBaseSensor = Class.create();

DiscoveryWindowsClusterBaseSensor.prototype = Object.extendsObject(DiscoverySensor, {
    prepare: function() {
        this.clusters = {};
        this.nodes = {};
        this.resources = {};
        this.rsrcData = {};  // a place to put resource data that won't pollute the resources...
        this.isVIP = false;
        this.isCluster = null;
    },
    
    findClusters: function(result) {
        var clusterEntries = g_array_util.ensureArray(result.MSCluster_Cluster);
        for (var i = 0; i < clusterEntries.length; i++) {
            var clusterEntry = clusterEntries[i];
            var cluster = {};
            cluster[ 'name'              ] = this.primStr( clusterEntry.Name        ).toLowerCase();
            cluster[ 'cluster_status'    ] = this.primStr( clusterEntry.Status      );
            cluster[ 'short_description' ] = this.primStr( clusterEntry.Description );
            cluster[ 'caption'           ] = this.primStr( clusterEntry.Caption     );
            cluster[ 'cmdb_ci_win_cluster_node' ]     = [];
            cluster[ 'cmdb_ci_win_cluster_resource' ] = [];
            cluster[ 'cmdb_ci_cluster_vip' ]          = [];
            this.clusters[cluster.name] = cluster;
        }
    },
    
    findNodes: function(result) {
        var nodeEntries = g_array_util.ensureArray(result.MSCluster_Node);
        for (var i = 0; i < nodeEntries.length; i++) {
            var nodeEntry = nodeEntries[i];
            var node = {};
            node[ 'name'              ] = this.primStr( nodeEntry.Name        ).toLowerCase();
            node[ 'node_status'       ] = this.primStr( nodeEntry.Status      );
            node[ 'short_description' ] = this.primStr( nodeEntry.Description );
            node[ 'node_state'        ] = this.primStr( nodeEntry.State       );
            node[ 'caption'           ] = this.primStr( nodeEntry.Caption     );
            node[ 'server'            ] = null;
            
            // find the associated server, if we can...
            var gr = new GlideRecord('cmdb_ci_win_server');
            if (gr.get('host_name', node.name))
                node.server = gr.getValue('sys_id');
            else if (gr.get('name', node.name))
                node.server = gr.getValue('sys_id');
            
            // stuff it away for later use...
            this.nodes[node.name] = node;
        }
    },
    
    findResources: function(result) {
        var resourceEntries = g_array_util.ensureArray(result.MSCluster_Resource);
        for (var i = 0; i < resourceEntries.length; i++) {
            var resourceEntry = resourceEntries[i];
            var resource = {};
            var rsrcDatum = {};
            resource [ 'name'              ] = this.primStr( resourceEntry.Name              );
            resource [ 'short_description' ] = this.primStr( resourceEntry.Description       );
            resource [ 'caption'           ] = this.primStr( resourceEntry.Caption           );
            resource [ 'resource_type'     ] = this.primStr( resourceEntry.Type              );
            resource [ 'resource_status'   ] = this.primStr( resourceEntry.Status            );
            resource [ 'properties'        ] = this.propertiesToHumanReadable( resourceEntry.PrivateProperties );
            rsrcDatum[ '_private_props'    ] = this.primStr( resourceEntry.PrivateProperties );
            rsrcDatum[ '_nodes'            ] = [];
            this.resources[resource.name] = resource;
            this.rsrcData[resource.name] = rsrcDatum;
        }
    },
    
    associateClustersToNodes: function(result) {
        var c2nEntries = g_array_util.ensureArray(result.MSCluster_ClusterToNode);
        for (var i = 0; i < c2nEntries.length; i++) {
            var c2nEntry = c2nEntries[i];
            var ant = this.getPropValue( 'MSCluster_Cluster.Name', c2nEntry.Antecedent ).toLowerCase();
            var dep = this.getPropValue( 'MSCluster_Node.Name',    c2nEntry.Dependent  ).toLowerCase();
            var cluster = this.clusters[ant];
            var node = this.nodes[dep];

            if (cluster && node)
                cluster.cmdb_ci_win_cluster_node.push(node);
        }
    },
    
    associateClustersToResources: function(result) {
        var c2rEntries = g_array_util.ensureArray(result.MSCluster_ClusterToResource);
        var source = this.primStr(this.getSource());
        for (var i = 0; i < c2rEntries.length; i++) {
            var c2rEntry = c2rEntries[i];
            var grp = this.getPropValue( 'MSCluster_Cluster.Name',  c2rEntry.GroupComponent ).toLowerCase();
            var prt = this.getPropValue( 'MSCluster_Resource.Name', c2rEntry.PartComponent  );
            var cluster = this.clusters[grp];
            var resource = this.resources[prt];
            var rsrcDatum = this.rsrcData[prt];
            if (cluster && resource) {
                cluster.cmdb_ci_win_cluster_resource.push(resource);
            
                // if we've got an IP Address resource, we may need to add a VIP as well...
                if (resource.resource_type != 'IP Address')
                    continue;

                var ip = this.getPropValue('Address', rsrcDatum._private_props);
				
                if (!ip)
                    continue;

                if (resource.name == 'Cluster IP Address') 				
                    cluster['ip_address'] = ip;
													
                var vip = {};
                vip['name'] = resource.name;
                vip['ip_address'] = ip;
                cluster.cmdb_ci_cluster_vip.push(vip);

                if (ip != source)
                    continue;

                this.isVIP = true;
                this.isCluster = cluster;
            }
        }
    },
    
    associateResourcesToNodes: function(result) {
        var r2nEntries = g_array_util.ensureArray(result.MSCluster_ResourceToPossibleOwner);
        for (var i = 0; i < r2nEntries.length; i++) {
            var r2nEntry = r2nEntries[i];
            var grp = this.getPropValue( 'MSCluster_Resource.Name',  r2nEntry.GroupComponent );
            var prt = this.getPropValue( 'MSCluster_Node.Name',      r2nEntry.PartComponent  ).toLowerCase();
            var resource = this.resources[grp];
            var rsrcDatum = this.rsrcData[grp];
            var node = this.nodes[prt];

            if (resource && node)
                rsrcDatum._nodes.push(node);
        }
    },
    
    propertiesToHumanReadable: function(properties) {
        var nvp = new NameValuePairs(this.primStr(properties));
        var pps = nvp.map;
        var props = '';
        for (var propName in pps) {
            var propValue = pps[propName];
            props += propName;
            props += ': ';
            props += propValue;
            props += '\n';
        }

        return props;
    },
    
    changeCI: function(newCIGR) {
        g_device.changeCI(newCIGR);
        // hack the probe so DeviceHistory returns the right CI sys_id...
        g_probe.addParameter('cmdb_ci', newCIGR.getValue('sys_id'));
    },
    
    findCluster: function(name) {
        var gr = this.queryForCluster(name);
        return gr.next() ? gr : null;
    },
    
    findOrCreateCluster: function(name) {
		var currentTime = new GlideDateTime();
		var hn = new HostnameJS(); 
		hn.format(name);		
		var newName =  hn.getFQDN(); // Follow the case property
		
        var gr = this.queryForCluster(newName);
        if (gr.next()) {
			//Compare case...
			if (gr.name != newName)
				gr.name = newName;				

			gr.last_discovered = currentTime;
			if (gs.nil(gr.first_discovered))
				gr.first_discovered = gr.sys_created_on;

			gr.update();
            return gr;
		}

        gr.initialize();
        gr.name = newName;
        gr.discovery_source = gs.getProperty('glide.discovery.source_name', "ServiceNow");
        gr.last_discovered = currentTime;
        gr.first_discovered = currentTime;
        gr.insert();

        return gr;
    },
    
    queryForCluster: function(name) {
        var gr = new GlideRecord('cmdb_ci_win_cluster');
        gr.addQuery('name', name);
        gr.query();

        return gr;
    },
    
    getPropValue: function(name, source) {
        var safeSource = this.primStr(source);
        if (!safeSource)
            return '';

        var nvp = new NameValuePairs(safeSource);

        return nvp.map[name];
    },
    
    primStr: function(value) {
        return (value) ? new String(value).toString() : null;
    },
    
    type: 'DiscoveryWindowsClusterBaseSensor'
});
