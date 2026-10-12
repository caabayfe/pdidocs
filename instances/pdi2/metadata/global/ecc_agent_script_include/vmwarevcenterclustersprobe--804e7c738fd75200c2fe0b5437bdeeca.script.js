/* jshint -W030 */
ObjectPolyfill;
ArrayPolyfill;

var VMWarevCenterClustersProbe = Class.create();

(function() {

var _this,
	statusMap = { green: 2, yellow: 3, red: 4 },
	hosts = [ ],
	pools = [ ],
	clusters = [ ],
	drsVMOverrides = [ ],
	moMap = { };

//////////////////////////////////////////////////////////////////////////
VMWarevCenterClustersProbe.prototype = Object.extendsObject(AVMWareProbe, {

    process : function() {
		var name,
			leftOverMors = JSON.parse('' + probe.getParameter('mor_ids')),
			debug = ('' + probe.getParameter('debug')) == 'true',
			// Average measured size of a cluster with associated hosts and resource
			// pools is 600 bytes.  Default page size of 1000 leaves us well below
			// the 5 MB limit.
			pageSize = parseInt(probe.getParameter('page_size')) || 1000,
			clusterMorIds = leftOverMors.splice(0, pageSize),
			originalData = [ ],
			results = {
				hosts: hosts,
				pools: pools,
				clusters: clusters,
				drsVMOverrides: drsVMOverrides
			},
			parent = { name: 'name' },
			resourceMap = {
				name: 'name',
				parent: { },
				config: {
					cpuAllocation: {
						reservation: 'cpu_reserved_mhz',
						limit: 'cpu_limit_mhz',
						expandableReservation: 'cpu_expandable',
						shares: { shares: 'cpu_shares' }
					},
					memoryAllocation: {
						reservation: 'mem_reserved_mb',
						limit: 'mem_limit_mb',
						expandableReservation: 'mem_expandable',
						shares: { shares: 'mem_shares' }
					}
				},
				vm: [ { } ]
			},
			computeMap = {
				host: [ { name: 'name' } ],
				resourcePool: resourceMap
			},
			clusterMap = {
				name: 'name',
				parent: parent,
				summary: {
					effectiveCpu: 'effectivecpu',
					effectiveMemory: 'effectivememory',
					numEffectiveHosts: 'effectivehosts',
					numHosts: 'numhosts',
					totalCpu: 'totalcpu',
					totalMemory: 'totalmemory',
					numCpuCores: 'numcpucores',
					numCpuThreads: 'numcputhreads',
					overallStatus: 'host_cluster_status'
				},
				//This block fetches the DRS settings for the cluster and the VMs that override the cluster DRS behaviour.
				configurationEx: {
					drsConfig: {
						defaultVmBehavior: 'drs_behavior',
						enabled: 'drs_enabled',
						vmotionRate: 'drs_vmotion_rate'
					},
					drsVmConfig: [{
						behavior: 'drs_behavior',
						enabled: 'drs_enabled',
						key: { }
					}]
				},
				host: [ { } ],
				resourcePool: resourceMap
			},
			dataMap = {
				ComputeResource: computeMap,
				ClusterComputeResource: clusterMap,
				ResourcePool: resourceMap
			},
			fixers = {
				ComputeResource: fixHost,
				ClusterComputeResource: fixCluster,
				ResourcePool: fixResourcePool
			};

		parent.parent = parent;
		resourceMap.resourcePool = [ resourceMap ];

		if (!this.serviceInstance)
			return;

		_this = this;

		/*
		Sample data.  Truncated for brevity, so possibly inconsistent:
			[
			  {
				"type": "ClusterComputeResource",
				"morid": "domain-c105",
				"name": "DC0_C14",
				"parent": {
				  "type": "Folder",
				  "morid": "group-h4",
				  "name": "host",
				  "parent": {
					"type": "Datacenter",
					"morid": "datacenter-2",
					"name": "DC0",
					"parent": {
					  "type": "Folder",
					  "morid": "group-d1",
					  "name": "Datacenters"
					}
				  }
				},
				"summary": {
				  "effectivecpu": 95968,
				  "effectivememory": 119744,
				  "effectivehosts": 8,
				  "numhosts": 8,
				  "totalcpu": 95968,
				  "totalmemory": 137402155008,
				  "numcpucores": 32,
				  "numcputhreads": 32
				},
				"host": [
				  {
					"type": "HostSystem",
					"morid": "host-1025"
				  },
				  {
					"type": "HostSystem",
					"morid": "host-113"
				  }
				],
				"resourcePool": {
				  "type": "ResourcePool",
				  "morid": "resgroup-106",
				  "name": "Resources",
				  "parent": {
					"type": "ClusterComputeResource",
					"morid": "domain-c105"
				  },
				  "config": {
					"cpuAllocation": {
					  "cpu_reserved_mhz": 95968,
					  "cpu_limit_mhz": 95968,
					  "cpu_expandable": true,
					  "shares": {
						"cpu_shares": 4000
					  }
					},
					"memoryAllocation": {
					  "mem_reserved_mb": 119744,
					  "mem_limit_mb": 119744,
					  "mem_expandable": true,
					  "shares": {
						"mem_shares": 163840
					  }
					}
				  },
				  "resourcePool": [
					{
					  "type": "ResourcePool",
					  "morid": "resgroup-1917",
					  "name": "DC0_C14_RP0",
					  "parent": {
						"type": "ResourcePool",
						"morid": "resgroup-106"
					  },
					  "config": {
						"cpuAllocation": {
						  "cpu_reserved_mhz": 0,
						  "cpu_limit_mhz": -1,
						  "cpu_expandable": true,
						  "shares": {
							"cpu_shares": 4000
						  }
						},
						"memoryAllocation": {
						  "mem_reserved_mb": 0,
						  "mem_limit_mb": -1,
						  "mem_expandable": true,
						  "shares": {
							"mem_shares": 163840
						  }
						}
					  },
					  "resourcePool": [
					  ]
					}
				  ]
				}
			  }
			]
		*/
		// Iterate over the MOR IDs of clusters we're going to explore
		clusterMorIds.forEach(
			function(cluster) {
				try {
					var table,
						clusterType = cluster.type,
						mor = new vim25.ManagedObjectReference();

					// Create a managed object for the current cluster, fetch data for it and its
					// resource pools from vCenter.
					// The "cluster" may be a ComputeResource or a ClusterComputerResource.
					// See http://pubs.vmware.com/vsphere-60/index.jsp?topic=%2Fcom.vmware.wssdk.apiref.doc%2Fvim.ComputeResource.html,
					// http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.ClusterComputeResource.html and
					// http://pubs.vmware.com/vsphere-60/index.jsp#com.vmware.wssdk.apiref.doc/vim.ResourcePool.html
					mor.setType(cluster.type);
					mor.setVal(cluster.morid);
					cluster = vim25.mo.util.MorUtil.createExactManagedEntity(_this.serverConnection, mor);
					cluster = _this.getPropsForUnknownType(cluster, dataMap);

					if (typeof dataMap[clusterType] == 'string')
						clusterType = dataMap[clusterType];

					// If we're debugging, save the data we fetched
					if (debug)
						originalData.push(JSON.stringify(cluster));

					// Fixup the data.
					fixers[clusterType](cluster);


				} catch (e) {
					this.probe.appendWarning('Caught exception when processing ' + cluster.type + ' ' + cluster.morid + ': ' + e.toString());
				}
			});

		// We've fetched all the clusters and resource pools. Calculate resource pool paths.
		try {
			getPoolPaths();
		} catch (e) {
			this.probe.appendWarning('Caught exception when calculating pool paths: ' + e.toString());
		}

		if (debug)
			results.originalData = originalData.map(JSON.parse);

		// We fetched at most pageSize clusters.  Send back the IDs of remaining clusters so the
		// sensor can fire another probe.
		if (leftOverMors.length)
			results.leftOverMors = leftOverMors;

		// Stringify the results, dropping anything named 'mo' (these are vijava ManagedObjects)
		this.output = JsonCi.decircularize(results, function(key, value) { if (key != 'mo') return value; });
	},

	type : 'VMWarevCenterClustersProbe'
});

//////////////////////////////////////////////////////////////////////////
function getPoolPaths() {

	pools.forEach(setPath);
	clusters.forEach(function(cluster) { delete cluster.parent; });

	function setPath(pool) {

		var path = getPath(pool);
		// The first item in the path is a root node that we don't want to incude in the path
		path.splice(0, 1);
		// The third (now second) item is the (invisible) clusters folder.
		path.splice(1, 1);
		pool.fullpath = path.join(' | ');

		delete pool.parent;
	}

	function getPath(mo) {
		var fullpath,
			parent = moMap[mo.parent.morid];
		if (!parent)
			return [ mo.name ];
		fullpath = getPath(parent);
		fullpath.push(mo.name);
		return fullpath;
	}
}

//////////////////////////////////////////////////////////////////////////
function mapParent(mo) {
	if (mo && mo.morid) {
		moMap[mo.morid] = mo;
		mapParent(mo.parent);
	}
}

//////////////////////////////////////////////////////////////////////////
function fixCluster(cluster, ownerName, hostMorid) {
	var name;

	mapParent(cluster);

	cluster.cmdb_ci_vcenter_folder = cluster.parent.morid;

	if (!ownerName)
		clusters.push(cluster);

	cluster.cmdb_ci_esx_server = cluster.host.map(
		function(host) {
			// The cluster sensor triggers host probes.  I need the list of hosts for this.
			hosts.push(host.morid);
			return host.morid;
		});
	delete cluster.host;

	fixResourcePool(cluster.resourcePool, ownerName || cluster.name, hostMorid, cluster.morid);
	delete cluster.resourcePool;

	for (name in cluster.summary)
		cluster[name] = cluster.summary[name];

	//Check if the drs config block exists in the datamap.
	var vmOverride, clusterConfig,
		configurationEx = cluster.configurationEx,
		drsConfig = configurationEx && configurationEx.drsConfig,
		drsVmConfigs = configurationEx && configurationEx.drsVmConfig;

	//Add the cluster drs config info to the cluster json
	if (drsConfig) {
		for (name in drsConfig)
			cluster[name] = drsConfig[name];
	}

	//Add the overridden VMs drs config info to the cluster json.
	//Add VMs drs behavior only if cluster drs enabled is true.
	if (cluster.drs_enabled) {
		drsVmConfigs.forEach(function(drsVmConfig) {
			var vmOverride = {
				cluster: cluster.morid,
				vm_morid: drsVmConfig.key.morid,
				drs_enabled: drsVmConfig.drs_enabled,
				drs_behavior: drsVmConfig.drs_behavior
			};
			drsVMOverrides.push(vmOverride);
		});
	}

	delete cluster.configurationEx;

	cluster.host_cluster_status = statusMap[cluster.host_cluster_status] || 1;
	delete cluster.summary;

	delete cluster.type;
}

//////////////////////////////////////////////////////////////////////////
function fixHost(host) {
	fixCluster(host, host.host[0].name, host.host[0].morid);
}

//////////////////////////////////////////////////////////////////////////
function fixResourcePool(pool, ownerName, hostMorid, clusterMorid) {
	var name;

	if (pool.type == 'VirtualApp')
		return;

	moMap[pool.morid] = pool;

	pools.push(pool);

	pool.owner = ownerName;
	pool.owner_morid = clusterMorid;
	pool.host_morid = hostMorid;

	pool.resourcePool.forEach(function(innerPool) {
		pool.containedPools = pool.containedPools || [ ];
		pool.containedPools.push(innerPool);
		fixResourcePool(innerPool, ownerName, hostMorid, clusterMorid);
	});
	delete pool.resourcePool;

	pool.vm.forEach(function(vm, idx) { pool.vm[idx] = vm.morid; });
	for (name in pool.config.cpuAllocation)
		pool[name] = pool.config.cpuAllocation[name];
	for (name in pool.config.memoryAllocation)
		pool[name] = pool.config.memoryAllocation[name];

	pool.cpu_shares = pool.config.cpuAllocation.shares.cpu_shares;
	pool.mem_shares = pool.config.memoryAllocation.shares.mem_shares;

	delete pool.shares;
	delete pool.config;
	delete pool.type;
}

})();
