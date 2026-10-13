// Discovery
var CiSchema = function() {
	this._tableOptions = {};
};

CiSchema.prototype.type = 'CiSchema';

CiSchema.prototype._DEFAULT_TABLE_OPTIONS = {
	'cmdb_ci_computer': {
		table: 'cmdb_ci_computer',
		indices: [ 'name' ],
		referrals: [
			{ table: 'cmdb_ci_storage_device', referenceField: 'computer' },
			{ table: 'cmdb_ci_storage_volume', referenceField: 'computer' },
			{ table: 'cmdb_ci_disk_partition', referenceField: 'computer', write: false },
			{ table: 'cmdb_ci_storage_pool', referenceField: 'hosted_by' },
			{ table: 'cmdb_ci_storage_hba', referenceField: 'computer' },
			{ table: 'cmdb_ci_storage_controller', referenceField: 'computer' },
			{ table: 'cmdb_ci_fc_port', referenceField: 'computer' },
			{ table: 'cmdb_ci_storage_export', referenceField: 'hosted_by' }
		]
	},
	
	'cmdb_ci_storage_device': {
		table: 'cmdb_ci_storage_device',
		indices: ['device_id', 'computer'],
		referrals: [
			{ table: 'cmdb_ci_disk_partition', referenceField: 'disk' },
			{ table: 'cmdb_ci_storage_pool_member', referenceField: 'storage' },
			{ table: 'cmdb_ci_storage_volume', referenceField: 'provided_by' },
			{ table: 'cmdb_fc_target' , referenceField: 'fc_disk'},
			{ table: 'cmdb_fc_initiator' , referenceField: 'fc_disk'}			
		],
		relations: [
			{ table: 'cmdb_ci_storage_volume', nature: 'Exports to::Imports from', isParent: false, write: false, create: true },
			{ table: 'cmdb_ci_storage_volume', nature: 'Provides::Provided by', isParent: true, write: true, create: true, reconcileExtended: true }
		]
	},
	
	'cmdb_ci_disk_partition': {
		// NOTE:  
		// cmdb_ci_disk_partition table field references the cmdb_ci_storage_device.
		// The reason for not storing the cmdb_ci_disk_partition name was not explained.  
		// Setting it to cmdb_ci_disk_partition does not appear to have a negative effect.
		// However there maybe a use case justifying the deviation from pattern used by the
		// other entries.
		table: 'cmdb_ci_storage_device',
		indices: ['partition_number', 'disk'],
		referrals: [
			{ table: 'cmdb_ci_file_system', referenceField: 'provided_by' },
			{ table: 'cmdb_ci_storage_pool_member', referenceField: 'storage' }
		]
	},
	
	'cmdb_ci_storage_volume': {
		table: 'cmdb_ci_storage_volume',
		indices: [ 'name', 'computer' ],
		referrals: [
			{ table: 'cmdb_ci_storage_export', referenceField: 'storage' }
		],
		relations: [
			{ table: 'cmdb_ci_storage_device', nature: 'Exports to::Imports from', write: false, create: true },
			{ table: 'cmdb_ci_storage_device', nature: 'Provides::Provided by', isParent: false, write: false, create: true }
		]
	},
	
	'cmdb_ci_storage_pool': {
		table: 'cmdb_ci_storage_pool',
		indices: [ 'pool_id', 'hosted_by' ],
		referrals: [
			{ table: 'cmdb_ci_storage_pool_member', referenceField: 'pool' },
			{ table: 'cmdb_ci_storage_pool_member', referenceField: 'storage' },
			{ table: 'cmdb_ci_storage_pool', referenceField: 'container' },
			{ table: 'cmdb_ci_storage_volume', referenceField: 'provided_by' },
			{ table: 'cmdb_ci_storage_device', referenceField: 'provided_by' }
		]
	},
			
	'cmdb_ci_storage_pool_member': {
		table: 'cmdb_ci_storage_pool_member',
		indices: [ 'pool', 'storage' ]
	},
	
	'cmdb_ci_fc_port': {
		table: 'cmdb_ci_fc_port',
		indices: ['computer', 'controller', 'wwpn'],
		referrals: [
			{ table: 'cmdb_ci_storage_device', referenceField: 'provided_by', write: false }
		],
		relations: [
			{ table: 'cmdb_ci_storage_controller', nature: 'Controller for::Controlled by', isParent: false }
		]
	},
	
	'cmdb_ci_storage_hba': {
		table: 'cmdb_ci_storage_hba',
		indices: ['computer','device_id'],
		referrals: [
			{ table: 'cmdb_ci_fc_port', referenceField: 'controller' },
		]
	},
			
	'cmdb_ci_storage_controller': {
		table: 'cmdb_ci_storage_controller',
		indices: ['computer','device_id'],
		referrals: [
			{ table: 'cmdb_ci_fc_port', referenceField: 'controller' },
			{ table: 'cmdb_ci_storage_export', referenceField: 'exported_by' }
		],
		relations: [
			{ table: 'cmdb_ci_fc_port', nature: 'Controller for::Controlled by' }
		]
	},
	
	'cmdb_ci_storage_export': {
		table: 'cmdb_ci_storage_export',
		indices: ['storage', 'exported_by'],
	},
	
	'cmdb_ci_wbem_service': {
		table: 'cmdb_ci_wbem_service',
		indices: ['cim_object_path'],
		referrals: [
			{ table: 'cmdb_ci_cim_profile', referenceField: 'cimom' },
		]
	},
	
	'cmdb_ci_cim_profile': {
		table: 'cmdb_ci_cim_profile',
		indices: ['name', 'version', 'cimom']
	},
	
	'cmdb_ci_san': {
		table: 'cmdb_ci_san',
		indices: [ 'san_id' ],
		referrals: [
			{ table: 'cmdb_ci_storage_switch', referenceField: 'san', deleteMissing: false },
			{ table: 'cmdb_ci_san_fabric', referenceField: 'san', deleteMissing: false },
			{ table: 'cmdb_ci_san_endpoint', referenceField: 'san', deleteMissing: false },
			{ table: 'cmdb_ci_san_connection', referenceField: 'san', deleteMissing: false },
		]
	},

	cmdb_ci_storage_switch: {
		table: 'cmdb_ci_storage_switch',
		referrals: [
			{ table: 'cmdb_ci_fc_port', referenceField: 'computer' }
		],
		relations: [
			{ table: 'cmdb_ci_computer', nature: 'Uses::Used by', isParent: false }
		]
	},

	'cmdb_ci_san_fabric': {
		table: 'cmdb_ci_san_fabric',
		indices: [ 'fabric_id' ],
		referrals: [
			{ table: 'cmdb_ci_san_zone_set', referenceField: 'fabric' }
		]
	},
	
	'cmdb_ci_san_zone_set': {
		table: 'cmdb_ci_san_zone_set',
		indices: [ 'zone_set_id', 'fabric' ],
		referrals: [
			{ table: 'cmdb_ci_san_zone', referenceField: 'zone_set' }
		]
	},
	
	'cmdb_ci_san_zone': {
		table: 'cmdb_ci_san_zone',
		indices: [ 'zone_id', 'zone_set' ],
		referrals: [
			{ table: 'cmdb_ci_san_zone_member', referenceField: 'zone' },
			{ table: 'cmdb_ci_san_zone_alias', referenceField: 'zone' }
		]
	},
	
	'cmdb_ci_san_zone_member': {
		table: 'cmdb_ci_san_zone_member',
		indices: [ 'endpoint', 'zone' ],
		referrals: [
			{ table: 'cmdb_ci_san_zone_alias_member', referenceField: 'zone_member' }
		]
	},
	
	'cmdb_ci_san_zone_alias': {
		table: 'cmdb_ci_san_zone_alias',
		indices: [ 'zone_alias_id', 'zone' ],
		referrals: [
			{ table: 'cmdb_ci_san_zone_alias_member', referenceField: 'zone_alias' }
		]
	},
	
	'cmdb_ci_san_zone_alias_member': {
		table: 'cmdb_ci_san_zone_alias_member',
		indices: [ 'zone_alias', 'zone_member' ]
	},
	
	'cmdb_ci_san_endpoint': {
		table: 'cmdb_ci_san_endoint',
		indices: [ 'endpoint_id', 'san' ],
		referrals: [
			{ table: 'cmdb_ci_san_zone_member', referenceField: 'endpoint' },
			{ table: 'cmdb_ci_san_connection', referenceField: 'endpoint1' },
			{ table: 'cmdb_ci_san_connection', referenceField: 'endpoint2' }
		]
	},
			
	'cmdb_ci_san_connection': {
		table: 'cmdb_ci_san_connection',
		indices: [ 'san', 'endpoint1', 'endpoint2' ]
	},
	
	'cmdb_fc_target' : {
		table: 'cmdb_fc_target',
		indices: ['wwnn', 'wwpn', 'fc_disk'],
		
	},
	
	'cmdb_fc_initiator' : {
		table: 'cmdb_fc_initiator',
		indices: ['wwnn', 'wwpn', 'fc_disk'],
		
	},

	/** 
	 * PRB948359
	 * Supresses error:
	 * 'Referral from 'Ci {computer:Ci {sys_id:'xxxx',table:'cmdb_ci_win_cluster'},table:'cmdb_ci_disk'}' 
	 * to 'Ci {sys_id:'xxxx'',table:'cmdb_ci_win_cluster'}' not valid based on Ci schema' 
	 */
	'cmdb_ci_cluster' : {
		table: 'cmdb_ci_cluster',
		indices: [ 'name' ],
		referrals: [
			{ table: 'cmdb_ci_storage_device', referenceField: 'computer' }
		]
	},
};

/**
 * Creates a Ci with options & schema pre-configured based on table.
 *
 * @param string|GlideRecord|Ci Either the table name or a record (Ci or GlideRecord).
 * @param {}|undefined data The data hash to initiate the new Ci with.
 */
CiSchema.prototype.createCi = function(table, data) {
	if (typeof data === 'undefined') {
		if (table instanceof GlideRecord) {
			data = table;
			table = ''+table.getTableName();
		} else if (table instanceof Ci) {
			data = table;
			table = table.table;
		} else {
			data = {};
		}
	}
	
	var options = this.getTableOptions(table);
	var ci = new Ci(options, data);
	return ci;
};
	
CiSchema.prototype.getTableOptions = function(table) {
	var tables = Ci.getTableHeirarchy(table);
	var options = null;

	for (var i = 0; i < tables.length; ++i) {
		var ciTable = tables[i];
		if (typeof this._DEFAULT_TABLE_OPTIONS[ciTable] !== 'undefined') {
			options = this._DEFAULT_TABLE_OPTIONS[ciTable];
			break;
		} else if (typeof this._tableOptions[ciTable] !== 'undefined') {
			options = this._tableOptions[ciTable];
			break;
		}
	}
	
	if (options === null) {
		options = { table: table };
	} else if (options.table !== table) {
		// clone and cache against this instance
		options = JSUtil.union(options);
		options.table = table;
		this._tableOptions[table] = options;
	}
	
	return options;
};
