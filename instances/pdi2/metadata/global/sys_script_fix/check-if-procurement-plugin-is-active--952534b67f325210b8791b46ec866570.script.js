// Check if the procurement plugin (com.snc.procurement) is active
var isProcurementInstalled = GlidePluginManager.isActive('com.snc.procurement');

// Determine the value for the asset property based on the plugin status
var value = isProcurementInstalled ? 'true' : 'false';

// Define the asset property key and description
var key = 'com.sn_itam.procurement.plugin.installed';
var description = 'Indicates if the Procurement Plugin is installed.';

// Initialize a GlideRecord for the Asset Property table
var assetPropertyGR = new GlideRecord('asset_property');
assetPropertyGR.addQuery('key', key);
assetPropertyGR.query();

// Check if the property already exists
if (assetPropertyGR.next()) {
	// If the property exists, update its value
	assetPropertyGR.setValue('value', value);
	assetPropertyGR.update();
} else {
	// If the property does not exist, create a new record
	assetPropertyGR.initialize();
	assetPropertyGR.setValue('key', key);
	assetPropertyGR.setValue('description', description);
	assetPropertyGR.setValue('value', value);
	assetPropertyGR.insert();
}

// Log a message indicating the operation is complete
gs.log('Asset property with key [' + key + '] has been created/updated successfully.');
