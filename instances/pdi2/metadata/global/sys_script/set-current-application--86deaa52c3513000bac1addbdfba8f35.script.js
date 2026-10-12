gs.setCurrentApplicationId(current.sys_id);

// the application's update set will now exist. Move the updates
// for the application from the previous update set to the current one
var newUpdateSet = new GlideRecord('sys_update_set');
newUpdateSet.query('application', current.sys_id);
if (!newUpdateSet.next()) {
	gs.logError('could not find the new update set for the new current application');
}
else {
	gs.log('found update set with sys_id ' + newUpdateSet.getValue('sys_id'));

	// Change the updates for the app itself to be in the app's update set
	var newUpdateXml = new GlideRecord('sys_update_xml');
	newUpdateXml.addQuery('application', current.sys_id);
	newUpdateXml.query();
	gs.log('for sys_app_' + current.sys_id + ', found ' + newUpdateXml.getRowCount() +
		   ' sys_update_xml records to update');
	while (newUpdateXml.next()) {
		newUpdateXml.setValue('update_set', newUpdateSet.getValue('sys_id'));
		newUpdateXml.setWorkflow(false);
		newUpdateXml.update();
	}
}
