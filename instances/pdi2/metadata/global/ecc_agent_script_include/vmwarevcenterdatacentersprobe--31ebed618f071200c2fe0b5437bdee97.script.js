/* jshint -W030 */
ObjectPolyfill;
ArrayPolyfill;
 
var VMWarevCenterDatacentersProbe = Class.create();

(function() {

var _this,
	output = { },
	resourceMap = {
		name: 'name'
	},
	computeMap = {
		host: [ { name: 'name' } ],
		resourcePool: resourceMap
	},
	 vmInsideVMFolder = [];

resourceMap.resourcePool = [ resourceMap ];

//////////////////////////////////////////////////////////////////////////
VMWarevCenterDatacentersProbe.prototype = Object.extendsObject(AVMWareProbe, {

//This function always returns all object IDs for a vCenter
//and then will filter object IDs in sensor if probe is not triggered for all DCs
    process : function() {
		var vc = new Packages.com.service_now.mid.util.VersionComparator(),
			vCenterMinApiVersion = '4.1';


		if (!this.serviceInstance)
			return;

        this.debug('Starting vCenter discovery...');
		_this = this;

		// Get information about the vCenter
		output.vcenter = fetchvCenter();

		// Error if vCenter version is too old.
		if (vc.compare(vCenterMinApiVersion, output.vcenter.version) < 0) {
			this.setError("vCenter version " + output.vcenter.version + " is not supported.  Only " + vCenterMinApiVersion + " or newer is supported");
			return;
		}

		// Get information about vCenter appliance
		//  This api is available in vCenter version 6.7 or greater
		if( output.vcenter.version >= "6.7")
			output.appliance = _this.getApplianceInfo();

		output.cmdb_ci_vcenter_datacenter = this.fetchManagedObjects('Datacenter', {
			name: 'name',
			vmFolder: 'folder_morid',
			hostFolder: 'host_morid'
		});

		if ('' + probe.getParameter('datacenters_only') != 'true') {
			// Now get the list of objects that exist in each datacenter
			output.cmdb_ci_vcenter_datacenter.forEach(
				function(dc) {
					dc.folders = walkFolderTrees(dc.mo, {
						name: 'name',
						datastoreFolder: { name: 'name' },
						hostFolder: { name: 'name' },
						networkFolder: { name: 'name' },
						vmFolder: { name: 'name' }
					});
				});

			getHosts(output.cmdb_ci_vcenter_datacenter);
			getOtherVMs(_this.serviceInstance, output.cmdb_ci_vcenter_datacenter);
		}

		// Stringify the results, dropping anything named 'mo' (these are vijava ManagedObjects)
		this.output = JSON.stringify(output, function(key, value) { if (key != "mo") return value; });
	},

	type : 'VMWarevCenterDatacentersProbe'
});

//////////////////////////////////////////////////////////////////////////
function getHosts(dcs) {

	var clusters = [ ],
		hosts = [ ],
		pools = [ ];

	output.hosts = hosts;

	dcs.forEach(
		function(dc) {
			extractClusters(dc.folders.hostFolder);
		});

	clusters.forEach(
		function(cluster) {

			cluster.host && cluster.host.forEach(
				function(host) {
					hosts.push(host.morid);
				});

			extractPools(cluster.resourcePool);
		});

	output.pools = pools;

	function extractPools(pool) {
		if (pool) {
			pools.push(pool.morid);
			pool.resourcePool.forEach(
				function(pool) {
					extractPools(pool);
				});
		}
	}

	function extractClusters(folder) {
		folder.childEntity.forEach(function (child) {
			if (child.type == 'Folder')
				extractClusters(child);
			else
				clusters.push(_this.getPropsForManagedObject(child.mo, computeMap));
		});
	}
}
//////////////////////////////////////////////////////////////////////////
function getOtherVMs(serviceInstance, dc) {
	var rootFolder = serviceInstance.getRootFolder();
	var managedEntities = vim25.mo.InventoryNavigator(rootFolder).searchManagedEntities('VirtualMachine');

	for (var i = 0; i < managedEntities.length; i++) {
            var obj = processVirtualMachine(managedEntities[i]);
            var parent = obj.propvals.get('parent');
            if (vmInsideVMFolder.indexOf(obj.vm.morid) == -1 && parent == null) {
                //vm is not present in vmFolder.Add it to vmFolder of 1st datacenter
                dc[0].folders.vmFolder.childEntity.push(obj.vm);
            }
        }
}

function processVirtualMachine(virtualMachine) {
	var nic,
	props = ['name', 'parent'];
	
	var propvals = virtualMachine.getPropertiesByPaths(props);
	var o = {};
	var e = propvals.keys();

	while (e.hasMoreElements()) {
		var key = e.nextElement();
		var prop = propvals.get(key);

		if (prop instanceof Packages.java.lang.Integer ||
			prop instanceof Packages.java.lang.Short ||
			prop instanceof Packages.java.lang.String ||
			prop instanceof Packages.java.lang.Long ||
			prop instanceof Packages.java.lang.Boolean)
			o[key] = '' + prop;
	}
	o.morid = '' + virtualMachine.getMOR().val;
	o.type = 'VirtualMachine';

	return {
		'vm': o,
		'propvals': propvals
	};
}

function fetchvCenter() {
	var dm = {
			'content.about.name': 'name',
			'content.about.osType': 'os_type',
			'content.about.version': 'version',
			'content.about.fullName': 'fullname',
			'content.about.apiVersion': 'api_version',
			'content.about.instanceUuid': 'instance_uuid'
		},
		vCenter = _this.getPropsForManagedObject(_this.serviceInstance, dm);

	vCenter.url = '' + _this.serverConnection.getUrl();

	return vCenter;
}

//////////////////////////////////////////////////////////////////////////
function walkFolderTrees(root, dataMap) {

	var name, vms,
		folders = _this.getPropsForManagedObject(root, dataMap);

	for (name in dataMap) {
		if (name == 'propNames')
			continue;

		folders[name].childEntity = walkFolderTree(folders[name].mo);
	}

	return folders;

	function walkFolderTree(root) {

		var childEntity = { childEntity: [ { name: 'name' } ] },
			folder = _this.getPropsForManagedObject(root, childEntity),
			newChildren = [ ];

		folder.childEntity.forEach(
			function(child) {
				if (child.type != 'VirtualApp')
					newChildren.push(child);
				if (child.type == 'VirtualMachine')
					vmInsideVMFolder.push(child.morid);
				if (child.type == 'Folder' || child.type == 'StoragePod')
					child.childEntity = walkFolderTree(child.mo);
				else if (child.type == 'VirtualApp')
					walkVirtualAppTree(child, newChildren);
			});

		return newChildren;
    }

	function walkVirtualAppTree(root, parentChildren) {
		var childEntity = { resourcePool: [ { } ], vm: [ { name: 'name' } ]},
			virtualApp = _this.getPropsForManagedObject(root.mo, childEntity);

		virtualApp.resourcePool.forEach(
			function(child) {
				child.childEntity = walkVirtualAppTree(child, parentChildren);
			}
		);

		virtualApp.vm.forEach(
			function(child) {
				parentChildren.push(child);
				vmInsideVMFolder.push(child.morid);
			}
		);
	}
}	

})();
