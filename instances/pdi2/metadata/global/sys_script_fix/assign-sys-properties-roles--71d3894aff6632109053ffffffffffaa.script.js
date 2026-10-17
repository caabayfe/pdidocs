var regularPropertySysIds = [
	'3a7015f1dbb302001e0599b8f0b8f59d', // Software License activity formatter fields
	'47fa0844db801200f35899b8f0b8f506', // Asset activity formatter fields
	'55c5009c54343110fa9b9285c3010f3e', // Excludes IBI assets from the Asset Workspace reports and Important actions on the Overview page
	'68d0d5f1dbb302001e0599b8f0b8f57d', // Consumable activity formatter fields
	'7a4f038977903110da1f99f69c5a996a', // Property to enable caching of Asset CI field, Asset CI Install Status, and Asset CI Hardware State mapping
	'92a095f1dbb302001e0599b8f0b8f532', // Hardware activity formatter fields
	'9f99aa2647e199103cbb5e52736d43d6', // Use model currency for catalog item when catalog item is published from model when property is set to true
	'e1e634f67f535a10b8791b46ec8665df', // Enables Flow Designer for processing Transfer Order flows
	'd2d57c4c771231106873136f1b5a997c', // Maximum count of transfer order lines that would be processed during each bulk update operation
	'ed1c7c474750f1107e20ea32736d4308', // Stock rule runner job process data from stock rule table in this batch size and log it in the asset job log
	'fa59618377623110da1f99f69c5a995c', // Property to enable calculation of product instance identifier for child assets
	'af3a8f86737b00107e88ef66fbf6a7d8', // If the value is "true", configuration item is created using IRE API when an asset is created
	'30d911de0f630010967863cda8767ec2', // If the value is "false", asset is created immediately when the Configuration item is created. If the value is "true", asset creation is deferred
	'2b5ceb46f8343110fa9b895a0632bb8f', // Model category activity formatter fields
	'efdade8353103110f9caddeeff7b12ea', // Property to store the value of last run of depreciation job
	'b9d0d1ed53147110f9caddeeff7b1236', // Property to enable caching of depreciation formula in Calculate Depreciation scheduled job
	'46acde8353103110f9caddeeff7b12f1', // Trigger depreciation job after days
	'1d601e627fc31610b8791b46ec866540', // Enables Flow Designer for processing Transfer Order Line flows
];

var nextPropertySysId = [
	'47351e72d7131100bbc783e80e61034b', // Generate shorter software model display name if the model name contains the manufacturer
];

AssetFixScriptUtil.setPropertyRoles(
	regularPropertySysIds,
	'asset_system_admin',
	'asset_system_admin',
	null,
	null
);

AssetFixScriptUtil.setPropertyRoles(
	nextPropertySysId,
	'model_manager,sam',
	'model_manager,sam',
	['model_manager', 'sam'],
	null
);
