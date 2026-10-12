var data_source = 'ConvertService';
gs.log('Starting converting service: ' + event.parm1, data_source);
current.setValue('status','IN PROGRESS');
current.update();
var service_id = current.getValue('service');
var bulk_id = current.getValue('bulk_transform');
var bulk = new GlideRecord('cmdb_convert_bulk_services');
bulk.get(bulk_id);
var level = bulk.getValue('level');
var is_dynamic = JSUtil.getBooleanValue(bulk,'type');
try {
	var bsm = new SNC.BusinessServiceManager();
	var blackListRelations = gs.getProperty("sa.mapping.system.manual.rel_type.blacklist","");
	var succeeded = bsm.convertToDiscoveredService(service_id, level, blackListRelations, is_dynamic, true);  // is_dynamic==true ? Populate cmdb_ci_service_calculated table : populate cmdb_ci_service_discovered table.
	if (succeeded === 'true') {
		current.setValue('status','COMPLETE');
	} else {
		current.setValue('status','FAILED');
		current.setValue('details', 'View the system logs for more info.');
	}
} catch(exc){
	current.setValue('status','FAILED');
	current.setValue('details', 'View the system logs for more info.');
} finally {
	current.update();
}
gs.log('Done converting service: ' + current.getDisplayValue('service'), data_source);
