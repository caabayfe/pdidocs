/* jshint -W030 */
ObjectPolyfill;
ArrayPolyfill;

var VMWarevCenterClusterDRSProbe = Class.create();

(function() {

	var _this,
		hostGroups = [],
		vmGroups = [],
		vmHostRules = [],
		vmAffinityRules = [];

	//////////////////////////////////////////////////////////////////////////
	VMWarevCenterClusterDRSProbe.prototype = Object.extendsObject(AVMWareProbe, {

		process: function() {
			var leftOverMors = JSON.parse('' + probe.getParameter('clusters')),
				debug = ('' + probe.getParameter('debug')) == 'true',
				// Average measured size of a cluster with associated hosts and resource
				// pools is 600 bytes.  Default page size of 1000 leaves us well below
				// the 5 MB limit.
				pageSize = parseInt(probe.getParameter('page_size')) || 1000,
				clusterMorIds = leftOverMors.splice(0, pageSize),
				originalData = [],
				results = {
					hostGroups: hostGroups,
					vmGroups: vmGroups,
					vmHostRules: vmHostRules,
					vmAffinityRules: vmAffinityRules
				},
				clusterMap = {
					//This block fetches the DRS settings for the cluster and the VMs that override the cluster DRS behaviour.
					//This also fetches the 'VM-Host Rules' & 'VM-Affinity Rules' from VMWare
					configurationEx: {
						rule: [{
							ruleUuid: 'rule_uuid',
							name: 'name',
							enabled: 'active',
							mandatory: 'mandatory',
							affineHostGroupName: 'affineHostGroupName',
							antiAffineHostGroupName: 'antiAffineHostGroupName',
							vmGroupName: 'vm_group',
							vm: [ { } ]
						}],
						group: [{
							name: 'name',
							host: [{}],
							vm: [ { } ]
						}]
					},
				},
				dataMap = {
					ClusterComputeResource: clusterMap
				},
				fixers = {
					ClusterComputeResource: fixCluster
				};

			if (!this.serviceInstance)
				return;

			_this = this;

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

			if (debug)
				results.originalData = originalData.map(JSON.parse);

			// We fetched at most pageSize clusters.  Send back the IDs of remaining clusters so the
			// sensor can fire another probe.
			if (leftOverMors.length)
				results.leftOverMors = leftOverMors;

			// Stringify the results, dropping anything named 'mo' (these are vijava ManagedObjects)
			this.output = JsonCi.decircularize(results, function(key, value) {
				if (key != 'mo') return value;
			});
		},

		type: 'VMWarevCenterClusterDRSProbe'
	});

	//////////////////////////////////////////////////////////////////////////
	function fixCluster(cluster) {
		//Check if the drs config block exists in the datamap.
		var configurationEx = cluster.configurationEx,
			groups = configurationEx && configurationEx.group,
			rules = configurationEx && configurationEx.rule;

		fixDRSGroup(groups, cluster);

		fixDRSRules(rules, cluster);

		delete cluster.configurationEx;
	}

	function fixDRSGroup(vmHostgroups, cluster) {
		vmHostgroups.forEach(function(group) {
			var groupParent = group.parent;
			group.cluster = cluster;
			if (groupParent.contains('ClusterHostGroup')) {
				delete group.vm;
				hostGroups.push(group);
			} else if (groupParent.contains('ClusterVmGroup')) {
				delete group.host;
				vmGroups.push(group);
			}
			delete group.parent;
		});
	}

	function fixDRSRules(clusterDRSRules, cluster) {
		clusterDRSRules.forEach(function(rule) {
			var ruleParent = rule.parent;

			rule.cluster = cluster;
			if (ruleParent.contains('ClusterVmHostRuleInfo')) {
				rule.host_group = rule.affineHostGroupName || rule.antiAffineHostGroupName;
				rule.affinity = rule.affineHostGroupName ? true : false;

				delete rule.vm;
				vmHostRules.push(rule);
			} else if (ruleParent.contains('ClusterAffinityRuleSpec'))
				pushAffinityRuleObject(rule, true);
			else if (ruleParent.contains('ClusterAntiAffinityRuleSpec'))
				pushAffinityRuleObject(rule, false);

			delete rule.affineHostGroupName;
			delete rule.antiAffineHostGroupName;
			delete rule.parent;
		});
	}

	function pushAffinityRuleObject(rule, isAffinity) {
		rule.affinity = isAffinity;

		delete rule.vm_group;
		delete rule.mandatory;
		vmAffinityRules.push(rule);
	}

})();
