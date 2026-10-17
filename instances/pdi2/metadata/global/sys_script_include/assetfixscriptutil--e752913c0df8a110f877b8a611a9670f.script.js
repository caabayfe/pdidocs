var AssetFixScriptUtil = Class.create();

AssetFixScriptUtil.renameFieldLabel = function(table, field, newLabel, newHint) {
	// update field label
	var docGr = new GlideRecord('sys_documentation');
	docGr.addQuery('name', table);
	docGr.addQuery('element', field);
	docGr.addQuery('label', '!=', newLabel);
	docGr.addQuery('language', 'en');
	docGr.query();

	if (docGr.next()) {
		docGr.setValue('label', newLabel);
		if (newHint) {
			docGr.setValue('hint', newHint);
		}
		docGr.update();
	}

	// update dictionary entry
	var dictGr = new GlideRecord('sys_dictionary');
	dictGr.addQuery('name', table);
	dictGr.addQuery('element', field);
	dictGr.addQuery('column_label', '!=', newLabel);
	dictGr.query();

	if (dictGr.next()) {
		dictGr.setValue('column_label', newLabel);
		dictGr.update();
	}
};

AssetFixScriptUtil.renameChoiceLabel = function(table, element, choiceLabel, choiceValue) {
	var gr = new GlideRecord('sys_choice');
	gr.addQuery('name', table);
	gr.addQuery('value', choiceValue);
	gr.addQuery('element', element);
	gr.query();
	if (gr.next()) {
		gr.setValue('label', choiceLabel);
		gr.update();
	}
};

AssetFixScriptUtil.setAttribute = function(table, field, newValue) {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', table);
	gr.addQuery('element', field);
	gr.query();
	if (gr.next()) {
		var result = '';
		var currAttr = gr.getAttribute();
		if (!gs.nil(currAttr)) {
			result = currAttr + ',';
		}
		result += newValue;
		gr.setValue('attributes', result);
		gr.update();
	}
};

AssetFixScriptUtil.updateDictionaryAttribute = function(table, field, columnName, columnValue) {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', table);
	gr.addQuery('element', field);
	gr.query();
	if (gr.next()) {
		gr.setValue(columnName, columnValue);
		gr.update();
	}
};

AssetFixScriptUtil.updateTableAttribute = function(table, columnName, columnValue) {
	var gr = new GlideRecord('sys_db_object');
	gr.addQuery('name', table);
	gr.query();
	if (gr.next()) {
		gr.setValue(columnName, columnValue);
		gr.update();
	}
};
AssetFixScriptUtil.fixDisplayValuesForAssetCIMapTables = function() {
	var assetCIgr = new GlideRecord('sys_dictionary');
	assetCIgr.addQuery('name', 'alm_asset_ci_field_mapping');
	assetCIgr.addQuery('element', 'IN', ['configuration_item_field', 'asset_field']);
	assetCIgr.query();
	while (assetCIgr.next()) {
		if (assetCIgr.getValue('element') === 'configuration_item_field') {
			assetCIgr.setValue('display', false);
		} else if (assetCIgr.getValue('element') === 'asset_field') {
			assetCIgr.setValue('display', true);
		}
		assetCIgr.update();
	}

	var astCIStgr = new GlideRecord('sys_dictionary');
	astCIStgr.addQuery('name', 'alm_hardware_state_mapping');
	astCIStgr.addQuery('element', 'IN', ['asset_substate', 'hardware_ci_status', 'hardware_ci_substatus', 'asset_state']);
	astCIStgr.query();
	while (astCIStgr.next()) {
		if (astCIStgr.getValue('element') === 'asset_substate' || astCIStgr.getValue('element') === 'hardware_ci_status'
            || astCIStgr.getValue('element') === 'hardware_ci_substatus') {
			astCIStgr.setValue('display', false);
		} else if (astCIStgr.getValue('element') === 'asset_state') {
			astCIStgr.setValue('display', true);
		}
		astCIStgr.update();
	}

	var astCIGr = new GlideRecord('sys_dictionary');
	astCIGr.addQuery('name', 'alm_asset_ci_state_mapping');
	astCIGr.addQuery('element', 'IN', ['asset_state', 'asset_substate', 'configuration_item_status']);
	astCIGr.query();
	while (astCIGr.next()) {
		if (astCIGr.getValue('element') === 'asset_substate' || astCIGr.getValue('element') === 'configuration_item_status') {
			astCIGr.setValue('display', false);
		} else if (astCIGr.getValue('element') === 'asset_state') {
			astCIGr.setValue('display', true);
		}
		astCIGr.update();
	}
};
AssetFixScriptUtil._appendActivityFieldValues = function(propName, fieldNames) {
	var uniqueFields = [];
	var propValue = gs.getProperty(propName);
	if (gs.nil(propValue)) {
		uniqueFields = fieldNames;
	} else {
		var arrayUtil = new global.ArrayUtil();
		var propValArr = propValue.split(',');
		uniqueFields = arrayUtil.diff(fieldNames, propValArr);
		uniqueFields = propValArr.concat(uniqueFields);
	}
	gs.setProperty(propName, uniqueFields.join(','));
};

AssetFixScriptUtil.updateReferenceQualifierIfEmpty = function(table, field, refQual) {
	var gr = new GlideRecord('sys_dictionary');
	gr.addQuery('name', table);
	gr.addQuery('element', field);
	gr.addNullQuery('reference_qual');
	gr.query();
	if (gr.next()) {
		gr.setValue('reference_qual', refQual);
		gr.update();
	}
};

/* Sets asset's activity formatter fields. fieldNames = [] */
AssetFixScriptUtil.addFieldsToAssetActivityProperty = function(fieldNames) {
	if (fieldNames.length > 0) {
		AssetFixScriptUtil._appendActivityFieldValues('glide.ui.alm_asset_activity.fields', fieldNames);
	}
};
/* Sets hardware's activity formatter fields. fieldNames = [] */
AssetFixScriptUtil.addFieldsToHardwareActivityProperty = function(fieldNames) {
	if (fieldNames.length > 0) {
		AssetFixScriptUtil._appendActivityFieldValues('glide.ui.alm_hardware_activity.fields', fieldNames);
	}
};
/* Sets consumable's activity formatter fields. fieldNames = [] */
AssetFixScriptUtil.addFieldsToConsumableActivityProperty = function(fieldNames) {
	if (fieldNames.length > 0) {
		AssetFixScriptUtil._appendActivityFieldValues('glide.ui.alm_consumable_activity.fields', fieldNames);
	}
};
/* Sets license's activity formatter fields. fieldNames = [] */
AssetFixScriptUtil.addFieldsToLicenseActivityProperty = function(fieldNames) {
	if (fieldNames.length > 0) {
		AssetFixScriptUtil._appendActivityFieldValues('glide.ui.alm_license_activity.fields', fieldNames);
	}
};

AssetFixScriptUtil.setPropertyRoles = function(sysIds, readRole, writeRole, readOverride, writeOverride) {
	if (!sysIds || !sysIds.length || !GlidePluginManager.isActive('com.glide.high_security')) {
		return;
	}
	var gr = new GlideRecord('sys_properties');
	gr.addQuery('sys_id', 'IN', sysIds.join(','));
	gr.query();
	while (gr.next()) {
		var originalReadRoles = gr.getValue('read_roles');
		var originalWriteRoles = gr.getValue('write_roles');
		gr.setWorkflow(false);
		var shouldUpdate = false;
		if (AssetFixScriptUtil._shouldUpdateRole(originalReadRoles, readRole, readOverride, originalWriteRoles)) {
			gr.setValue('read_roles', Array.isArray(readRole) ? readRole.join(',') : readRole);
			shouldUpdate = true;
		}
		if (AssetFixScriptUtil._shouldUpdateRole(originalWriteRoles, writeRole, writeOverride, originalReadRoles)) {
			gr.setValue('write_roles', Array.isArray(writeRole) ? writeRole.join(',') : writeRole);
			shouldUpdate = true;
		}
		if (shouldUpdate) {
			gr.update();
		}
	}
};

AssetFixScriptUtil._shouldUpdateRole = function(currentRoles, newRole, override, oppositeRoles) {
	if (gs.nil(newRole)) {
		return false;
	}
	if (gs.nil(override)) {
		return gs.nil(currentRoles) && gs.nil(oppositeRoles);
	}
	if (!gs.nil(currentRoles)) {
		return false;
	}
	if (gs.nil(oppositeRoles)) {
		return true;
	}
	var oppositeArr = oppositeRoles.split(',').map(function(r) {
		return r.trim();
	}).filter(function(r) {
		return r !== '';
	});
	return AssetFixScriptUtil._isSubsetOrEqual(oppositeArr, override);
};

AssetFixScriptUtil._isSubsetOrEqual = function(subset, superset) {
	if (!subset || subset.length === 0 || subset.length > superset.length) {
		return false;
	}
	for (var i = 0; i < subset.length; i++) {
		var found = false;
		for (var j = 0; j < superset.length; j++) {
			if (subset[i].trim() === superset[j].trim()) {
				found = true;
				break;
			}
		}
		if (!found) {
			return false;
		}
	}
	return true;
};
