var cmn_tables = [
	"cmn_schedule",
	"cmn_schedule_span",
	"cmn_user_schedule",
	"cmn_other_schedule"
];

updateCmnTables();

function updateCmnTables() {	
	if (pm.isZboot())
		return;
	
	var dbObjects = new GlideRecord('sys_db_object');
	dbObjects.addQuery('name', 'IN', cmn_tables.join(','));
	dbObjects.setValue('read_access', true);
	dbObjects.setValue('update_access', true);
	dbObjects.setValue('create_access', true);
	dbObjects.setValue('delete_access', true);
	dbObjects.setValue('alter_access', true);
	dbObjects.setValue('actions_access', true);
	dbObjects.setValue('client_scripts_access', true);
	dbObjects.setValue('ws_access', true);

	dbObjects.setWorkflow(false);
	dbObjects.setUseEngine(false);
	dbObjects.updateMultiple();
}
