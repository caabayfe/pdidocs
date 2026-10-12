updateDictionary();

function updateDictionary(){
	//Only change dictionary entry on upgrades as zboot already have the change
	if (!pm.isZboot()) {
		//Fetch the reference field for Business Service
		var dictionaryGr = new GlideRecord('sys_dictionary');
		dictionaryGr.addQuery('name', 'task_cmdb_ci_service');
		dictionaryGr.addQuery('element', 'cmdb_ci_service');
		dictionaryGr.addQuery('reference', 'cmdb_ci_service');

		dictionaryGr.query();
		//check if the dictionary entry has been modified
		if (sn_collision.CollisionAPI.willBeReplacedOnUpgrade(dictionaryGr)) {
			//Update the reference field to cmdb_ci
			dictionaryGr.setValue('reference', 'cmdb_ci');
			dictionaryGr.setValue('column_label', 'Configuration Item');
			dictionaryGr.update();
		}
	} 
}
