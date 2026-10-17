gs.info('FIX SCRIPT: Updating the sys_package.ide_created field for any custom apps created from a Template.');

var appTemplateRecs = new GlideRecord('sys_app_template_output_var_instance');
appTemplateRecs.addQuery('name', 'app_sys_id');
appTemplateRecs.addQuery('template_instance.state', 'complete');
appTemplateRecs.addQuery('template_instance.app_template', true);
appTemplateRecs.addQuery('value', 'NOT LIKE', 'step');

appTemplateRecs.query();

gs.info('FIX SCRIPT: Found ' + appTemplateRecs.getRowCount() + ' App Template - App record(s)!');

var updateCnt = 0;
var appSysIdArray = [];
while (appTemplateRecs.next()) {

	var appSysId = appTemplateRecs.getValue('value');
	appSysIdArray.push(appSysId);

	// Update in batches of 1000, or until there are no more records to process
	if (appTemplateRecs.hasNext() && appSysIdArray.length < 1000)
		continue;

	var gmu = new GlideMultipleUpdate('sys_package');
	gmu.addQuery('sys_id', 'IN', appSysIdArray);
	gmu.addNullQuery('ide_created');
	gmu.addQuery('sys_class_name', 'sys_app');  // Only update those records that have a corresponding sys_app record

	gmu.setValue('ide_created', 'AES');
	
	gmu.execute();
	updateCnt += gmu.getUpdateCount();
	appSysIdArray = [];  // Reset the array for the next loop
}

gs.info('FIX SCRIPT: Total sys_package records updated: ' + updateCnt);
