// get the package sys_id
var packageID = "-1";
var scopeName = !parent.scope.nil() ? parent.scope.toString() : 'global';

// check if the source is actually a scoped application
// if so the packageID is the scopeID
var scope = new GlideRecord('sys_scope');
if (scopeName !== 'global' && scope.get('scope', scopeName)) {
	packageID = scope.getUniqueValue();
	var files = new GlideRecord('sys_metadata');
	files.addQuery('sys_package', packageID);
	files.query();
	// exclude customer files if any
	var customerFileIds = new global.UpdateVersionAPI().getCustomerFileIds(files);
	if (customerFileIds.length > 0)
		current.addQuery('sys_id', 'NOT IN', customerFileIds);
} else {
	var plugin = new GlideRecord("sys_plugins");
	if (plugin.get("source", parent.id.toString()))
		packageID = plugin.getUniqueValue();
}

current.addQuery("sys_package", packageID);
