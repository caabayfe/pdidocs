/*
Returns array of string of table names in hierarchy.
*/
function _getTableHierarchy(className) {
	var tableUtil = new TableUtils(className);
	var arrayUtils = new ArrayUtil();
	var tableArray = arrayUtils.convertArray(tableUtil.getTables());
	return tableArray.toString().split(',');
}

/*
Returns model based on mapped lifecycle table.
If no mapping is present returns cmdb_model.
*/
function _getLifecycleModel(lifecycleClass) {
	var lifecycleModelMap = {
		cmdb_model_lifecycle: 'cmdb_model',
		cmdb_hardware_model_lifecycle: 'cmdb_hardware_product_model',
		cmdb_consumable_model_lifecycle: 'cmdb_consumable_product_model',
		cmdb_application_model_lifecycle: 'cmdb_application_product_model',
		cmdb_contract_model_lifecycle: 'cmdb_contract_product_model',
		cmdb_facility_model_lifecycle: 'cmdb_facility_product_model',
		cmdb_service_model_lifecycle: 'cmdb_service_product_model'
	};
	var lifecycleClasses = Object.keys(lifecycleModelMap);
	var tableHierarchy = _getTableHierarchy(lifecycleClass);
	var lifecycleModel = 'cmdb_model';
	for (var i = 0; i < tableHierarchy.length; i++) {
		var tableName = tableHierarchy[i];
		if (lifecycleClasses.indexOf(tableName) > -1) {
			lifecycleModel = lifecycleModelMap[tableName];
			break;
		}
	}
	return lifecycleModel;
}

(function executeRule(current) {
	var SOFTWARE_MODEL = 'cmdb_software_product_model';
	var modelClass = current.model.sys_class_name.toString();
	var modelHierarchy = _getTableHierarchy(modelClass);
	var lifecycleClass = current.sys_class_name.toString();
	// Restrict creation of lifecycle for software model and their childs
	if (modelHierarchy.indexOf(SOFTWARE_MODEL) > -1) {
		gs.addErrorMessage(gs.getMessage('Lifecycle cannot be created for software model on "{0}"', [lifecycleClass]));
		current.setAbortAction(true);
	} else {
		var lifecycleModel = _getLifecycleModel(lifecycleClass);
		// Allow creation of lifecycle if model present in modelHierarchy
		if (modelHierarchy.indexOf(lifecycleModel) === -1) {
			gs.addErrorMessage(gs.getMessage('Lifecycle cannot be created for "{0}" on "{1}"', [modelClass, lifecycleClass]));
			current.setAbortAction(true);
		}
	}
})(current);
