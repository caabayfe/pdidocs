ArrayPolyfill;
var DiscoveryVolumeToDiskMapper;

(function() {
	
var isDebugging = false;
var traversed = [ ];

function log() {

	if (!isDebugging)
		return;

	Debug.log.apply(Debug, arguments);
}

/**
 * Provides path traversal methods between Volume CIs and their providing Storage Device(s).
 * Traverses Storage Pools, Partitions, etc.
 *
 * @since geneva
 * @author shlomi.sividia
 * @author roy.laurie
 */
DiscoveryVolumeToDiskMapper = function(options) {
	isDebugging = options && options.debug;
};

DiscoveryVolumeToDiskMapper.type = 'DiscoveryVolumeToDiskMapper';

/**
 * Relates providing Storage Devices to the specified Volume using a 'Provides::Provided by' relationship.
 * @param Ci volumeCi A Ci object of type cmdb_ci_storage_volume 
 */
DiscoveryVolumeToDiskMapper.prototype.relateStorageDevice = function(volumeCi) {

	log('Relating storage for Volume', volumeCi.data.name);
	
	var providedByCi = volumeCi.data.provided_by;
	var storageDeviceCis = [];
	traverseProvider(providedByCi, storageDeviceCis);
	
	log('Size of traversal result: ', storageDeviceCis.length);
	
	for (var i = 0; i < storageDeviceCis.length; ++i) {
		log('Adding storage device relation', storageDeviceCis[i].data.name);
		
		volumeCi.addRelation(storageDeviceCis[i], 'cmdb_ci_storage_device', 'Provides::Provided by');
	}
};

/**
 * Recursively traverses the CMDB adding final providing disks to the disk array.
 * @param Ci providerCi
 * @param Ci[] disks
 */
function traverseProvider(providerCi, disks) {

	// Enforce preconditions
	//   1) When mappedDevices alias is multipath the first call to 
	//      DiscoveryLinuxStorageSensor script will have providerCi set to null.
	//      Subsequent calls may have the property "data" set to null.
	//   2) doTraversal nested function should only be called through this function.

	if (JSUtil.nil(providerCi)) {
		log('traverseProvider: providerCI is null');
		return; 
	}

	if (JSUtil.nil(providerCi.data)) {
		log('traverseProvider: providerCi.data is NULL');
		return; 
	}
    
	if (traversed.indexOf(providerCi) != -1) {
		log('traverseProvider: Circular traversal');
		return;
	}

	traversed.push(providerCi);
	doTraversal();
	traversed.pop();

	// nested function: outer scope variables (providerCi, disks)
	function doTraversal() {

        // shared local variables
        var i = 0;

		log('Provided by', providerCi.table + ':' + providerCi.data.name);

		if (providerCi.extendsFromTable('cmdb_ci_disk')) {
			// If the provider is a physical disk, simply add to the results.
			log('Inside cmdb_ci_disk: ', providerCi.data.name);

			disks.push(providerCi);
		} else if (providerCi.extendsFromTable('cmdb_ci_disk_partition')) {
			// If the provider is a disk partition, simple return the parent disk (cmdb_ci_disk).
			log('Inside cmdb_ci_disk_partition: ', providerCi.data.name);

			disks.push(providerCi.data.disk);
		} else if (providerCi.extendsFromTable('cmdb_ci_storage_device')) {
			// If the provider is a generic storage device that is not physical (cmdb_ci_disk),
			// begin traversing through the provided_by field.
			log('Inside cmdb_ci_storage_device: ', providerCi.data.name);

			if (providerCi.data.provided_by != null) {
				// Log data.provided_by.data structure (data.provided_by.data field may be null)
				log('provided_by: ', providerCi.data.provided_by.data);

				return traverseProvider(providerCi.data.provided_by, disks);
			}
		} else if (providerCi.extendsFromTable('cmdb_ci_storage_pool')) {
			// If the provider is a generic storage pool, either:
			// 1. Attempt to find storage pool members (cmdb_ci_storage_pool_member)
			// 2. If no storage pool members are found, try to find nested pools
			//    (cmdb_ci_storage_pool)
			log('Inside cmdb_ci_storage_pool: ', providerCi.data.name);

			var poolMemberCis = providerCi.getReferrals('cmdb_ci_storage_pool_member', 'pool');

			if (poolMemberCis.length !== 0) {
				// If we have storage pool members, traverse each 
				// cmdb_ci_storage_pool_member.storage field
				log('Size of poolMemberCis: ', poolMemberCis.length);

				for (i = 0; i < poolMemberCis.length; ++i) {
					// Log data.storage structure (data.storage.data field may be null)
					log('looking for storage: ', poolMemberCis[i].data.storage);

					traverseProvider(poolMemberCis[i].data.storage, disks);
				}
			} else {
				// If no storage pool members were found, search for nested storage
				// pools (with their container field set)
				var containedPoolCis = providerCi.getReferrals('cmdb_ci_storage_pool');

				if (containedPoolCis == null) {
					log('doTraversal: containedPoolCis is null');
					return;
				}

				log('Found ' + containedPoolCis.length + ' contained pools');

				for (i = 0; i < containedPoolCis.length; ++i) {
					// Log containedPoolCis[i].data structure (containedPoolCis[i].data
					// field may be null)
					log('Found contained pool', containedPoolCis[i].data);

					traverseProvider(containedPoolCis[i], disks);
				}
			}
		} else if (providerCi.extendsFromTable('cmdb_ci_storage_pool_member')) {
			// If the provider is a storage pool member, traverse the parent pool.
			log('Inside cmdb_ci_storage_pool_member: ', providerCi.data.name);

			return traverseProvider(providerCi.data.pool);
		} else {
			log('provider ci has is not matching no any class ', providerCi.data.name);
		}
	}
}
	
})();
