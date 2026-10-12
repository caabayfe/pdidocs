(function executeRule(current, previous) {
	// Find all child assets of the current asset
	var childGr = new GlideRecord('alm_asset');
	childGr.addQuery('parent', current.sys_id);
	childGr.addNullQuery('model_component_id');
	childGr.addEncodedQuery('sys_class_name!=alm_consumable');
	childGr.query();
	var sysIdArr = [];
	while (childGr.next()) {
		// Find the model component definitions
		var mcGr = new GlideRecord('cmdb_m2m_model_component');
		mcGr.addQuery('child', childGr.model);
		mcGr.addQuery('parent', current.model);
		mcGr.query();
		var rowCount = mcGr.getRowCount();
		if (rowCount === 1) { // If single model component, update the value
			mcGr.next();
			childGr.setValue('model_component_id', mcGr.sys_id);
			childGr.update();
		} else if (rowCount > 1) {
			while (mcGr.next()) {
				var flag = true;
				for (var i = 0; i < sysIdArr.length; i++) { // Check if model component already assigned
					if (sysIdArr[i] === mcGr.sys_id) {
						flag = false;
						break;
					}
				}
				if (flag) {
					sysIdArr.push(mcGr.sys_id); // Keep track of used model component
					childGr.setValue('model_component_id', mcGr.sys_id);
					childGr.update();
					break;
				}
			}
		}
	}
}(current, previous));
