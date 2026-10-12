var AssetManagementConstants = Class.create();
AssetManagementConstants.prototype = {
	initialize: function () { },
	type: 'AssetManagementConstants',
};

AssetManagementConstants.ASSET_STATUSES = {
	IN_STOCK: '6',
	MISSING: '8',
	IN_TRANSIT: '9',
	RETIRED: '7',
	IN_MAINTENANCE: '3',
	ON_ORDER: '2',
	IN_USE: '1',
	CONSUMED: '10',
	BUILD: '11',
};

AssetManagementConstants.ASSET_SUB_STATUSES = {
	AVAILABLE: 'available',
	RESERVED: 'reserved',
	LEASE_RETURN: 'lease_return',
	PENDING_TRANSFER: 'pending_transfer',
	NONE: '',
	NULL: null,
	PENDING_REPAIR: 'pending_repair',
	PENDING_DISPOSAL: 'pending_disposal',
	PENDING_INSTALL: 'pending_install',
	DEFECTIVE: 'defective',
	DISPOSED: 'disposed',
	DONATED: 'donated',
	LOST: 'lost',
	PRE_ALLOCATED: 'pre_allocated',
	SOLD: 'sold',
	STOLEN: 'stolen',
	VENDOR_CREDIT: 'vendor_credit',
};

AssetManagementConstants.ASSET_CLASSES = {
	CONSUMABLE: 'alm_consumable',
	FACILITY: 'alm_facility',
	HARDWARE: 'alm_hardware',
	SOFTWARE_ENTITLEMENT: 'alm_license',
	BUNDLE: 'alm_bundle',
	ASSET: 'alm_asset',
	ENTERPRISE_INDUSTRIAL_ASSET: 'sn_ent_industrial_asset',
	PALLET: 'alm_pallet',
};

AssetManagementConstants.MODEL_CLASSES = {
	PRODUCT_MODEL: 'cmdb_model',
	HARDWARE_MODEL: 'cmdb_hardware_product_model',
	CONSUMABLE_MODEL: 'cmdb_consumable_product_model',
	APPLICATION_MODEL: 'cmdb_application_product_model',
	CONTRACT_MODEL: 'cmdb_contract_product_model',
	FACILITY_MODEL: 'cmdb_facility_product_model',
	SERVICE_MODEL: 'cmdb_service_product_model',
	SOFTWARE_MODEL: 'cmdb_software_product_model',
	MODEL_COMPONENT: 'cmdb_m2m_model_component',
};

AssetManagementConstants.MODEL_STATUSES = {
	IN_PRODUCTION: 'In Production',
	BUILD: 'Build',
	RETIRED: 'Retired',
	SOLD: 'Sold',
};

// For CSDM lifecycle fields
AssetManagementConstants.LIFECYCLE_STAGES = {
	END_OF_LIFE: 'End of Life',
	DESIGN: 'Design',
	OPERATIONAL: 'Operational',
	INVENTORY: 'Inventory',
	DEPLOY: 'Deploy',
	MISSING: 'Missing',
	PURCHASE: 'Purchase',
	DEFECTIVE: 'Defective',
	PIPELINE: 'Pipeline',
};

AssetManagementConstants.LIFECYCLE_STAGE_STATUSES = {
	AVAILABLE: 'Available',
	BUILD: 'Build',
	BUY_OUT: 'Buy Out',
	CANCELLED: 'Cancelled',
	CHARTERED: 'Chartered',
	DESIGN: 'Design',
	DISPOSED: 'Disposed',
	DONATED: 'Donated',
	DRAFT: 'Draft',
	END_OF_SUPPORT: 'End of Support',
	EXPIRED: 'Expired',
	IN_MAINTENANCE: 'In Maintenance',
	IN_STOCK: 'In Stock',
	IN_TRANSIT: 'In Transit',
	IN_USE: 'In Use',
	LEASE_RETURN: 'Lease Return',
	LEGAL_HOLD: 'Legal Hold',
	LOST: 'Lost',
	OBSOLETE: 'Obsolete',
	ON_ORDER: 'On Order',
	PENDING_CERTIFICATE: 'Pending Certificate',
	PENDING_DISPOSAL: 'Pending Disposal',
	PENDING_REPAIR: 'Pending Repair',
	PENDING_RETIREMENT: 'Pending Retirement',
	PENDING_TRANSFER: 'Pending Transfer',
	PILOT: 'Pilot',
	PRE_ALLOCATED: 'Pre Allocated',
	PUBLISHED: 'Published',
	QUARANTINE: 'Quarantine',
	RESERVED: 'Reserved',
	RETIRED: 'Retired',
	RMA: 'RMA',
	SOLD: 'Sold',
	STOLEN: 'Stolen',
	TEST: 'Test',
	UNDER_EVALUATION: 'Under Evaluation',
	VENDOR_CREDIT: 'Vendor Credit',
};
