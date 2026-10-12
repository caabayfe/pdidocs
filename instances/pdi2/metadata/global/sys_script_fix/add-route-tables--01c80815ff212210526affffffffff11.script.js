var valueString = GlidePropertiesDB.get('glide.ui.permitted_tables');
var valueArray;
var doUpdate = false;

if (!valueString) {
	valueArray = ['sys_ux_app_route', 'sys_ux_interoperable_route'];
	doUpdate = true;
} else {
	valueArray = ('' + valueString).split(',');
	if (valueArray.indexOf('sys_ux_app_route') === -1) {
		valueArray.push('sys_ux_app_route');
		doUpdate = true;
	}
	if (valueArray.indexOf('sys_ux_interoperable_route') === -1) {
		valueArray.push('sys_ux_interoperable_route');
		doUpdate = true;
	}
}

if (doUpdate) {
    var newString = valueArray.join(',');
    gs.info('Updating property "glide.ui.permitted_tables" to "' + newString + '".');
    GlidePropertiesDB.set('glide.ui.permitted_tables', newString);
}
