/* jshint -W030 */
ObjectPolyfill;
ArrayPolyfill;

var StandaloneESXProbe = Class.create();

(function() {

var _this,
	output = { },
	resourceMap = {
		name: 'name'
	},
	computeMap = {
		host: [ { name: 'name' } ],
		resourcePool: resourceMap
	};

resourceMap.resourcePool = [ resourceMap ];

//////////////////////////////////////////////////////////////////////////
StandaloneESXProbe.prototype = Object.extendsObject(AVMWareProbe, {

process : function() {
	var name, dcs,
		vc = new Packages.com.service_now.mid.util.VersionComparator(),
		vSphereApiVersion = '4.1',
		mors = JSON.parse('' + probe.getParameter('mor_ids')),
		morMap = { };

	if (!this.serviceInstance)
		return;

        this.debug('Starting ESX Sever discovery...');
	_this = this;

	// Get information about the esx server
	output.esx = fetchESXServer();

	// Error if ESX version is too old.
	if (vc.compare(vSphereApiVersion, output.esx.version) < 0) {
		this.setError("ESX version " + output.esxServer.version + " is not supported.  Only " + vSphereApiVersion + " or newer is supported");
		return;
	}
	dcs = this.fetchManagedObjects('Datacenter', {
		name: 'name',
		vmFolder: 'folder_morid',
		hostFolder: 'host_morid'
	});
	if (mors) {
		output.esxdc = [ ];
		mors.forEach(function(mor) { morMap[mor.morid] = 1; });
		dcs.forEach(function(dc) { if (morMap[dc.morid]) output.esxdc.push(dc); });
	} else
		output.esxdc = dcs;

	// Now get the list of objects that exist in ESX Server
	output.esxdc.forEach(
		function(dc) {
			dc.folders = walkFolderTrees(dc.mo, {
				name: 'name',
				datastoreFolder: { name: 'name' },
				hostFolder: { name: 'name' },
				networkFolder: { name: 'name' },
				vmFolder: { name: 'name' }
			});
		});
	getHosts(output.esxdc);

	// Stringify the results, dropping anything named 'mo' (these are vijava ManagedObjects)
	this.output = JSON.stringify(output, function(key, value) { if (key != "mo") return value; });
},

	type : 'StandaloneESXProbe'
});

//////////////////////////////////////////////////////////////////////////
function getHosts(esxs) {

	var clusters = [ ],
		hosts = [ ],
		pools = [ ];

	output.hosts = hosts;
	esxs.forEach(
		function(esx) {
			extractClusters(esx.folders.hostFolder);
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
function fetchESXServer() {
	var dm = {
		'content.about.name': 'name',
		'content.about.version': 'version',
		'content.about.fullName': 'fullname',
		'content.about.apiVersion': 'api_version'
	},
	esxServer = _this.getPropsForManagedObject(_this.serviceInstance, dm);
	esxServer.url = '' + _this.serverConnection.getUrl();
	return esxServer;
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
			}
		);
	}
}

})();
