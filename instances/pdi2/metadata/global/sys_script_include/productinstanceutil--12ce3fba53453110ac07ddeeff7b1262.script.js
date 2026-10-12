var ProductInstanceUtil = Class.create();
ProductInstanceUtil.prototype = {
	initialize: function() {},
	type: 'ProductInstanceUtil',
};

ProductInstanceUtil.isProductInstance = function(modelCategoryId) {
	// eslint-disable-next-line
	return sn_cmdb.ProductInstance.isProductInstance(modelCategoryId);
};

ProductInstanceUtil.getPIDConfig = function(productInstanceClass, modelCategoryId) {
	// eslint-disable-next-line
	return sn_cmdb.ProductInstance.getPIDConfig(productInstanceClass, modelCategoryId);
};

ProductInstanceUtil.generatePIDForEntity = function(modelCategory, entityClassName, entityGr,
	valueHash) {
	var entityJson = ProductInstanceUtil.getPIDAttrForEntity(entityGr, valueHash);
	return ProductInstanceUtil.generatePID(entityClassName, modelCategory, entityJson);
};

ProductInstanceUtil.generatePID = function(productInstanceClass, modelCategoryId, columnHash) {
	try {
		// eslint-disable-next-line
		var result = sn_cmdb.ProductInstance.generatePID(productInstanceClass, modelCategoryId, columnHash);
		if (typeof result === 'string') {
			return result;
		}
		return result.product_instance_id;
	} catch (e) {
		gs.log('PID generation failed');
	}
	return '';
};

/**
 * Returns the sysId if a match is found with same entityGr
 */
ProductInstanceUtil.identifyEntityThroughIRE = function(entityGr) {
	var payload = {
		items: [{
			className: entityGr.getTableName(),
			values: ProductInstanceUtil.getEntityJson(entityGr),
		}],
	};

	var cmdbUtil = new AssetCMDBUtil();
	var checkResult = cmdbUtil.checkInsertOrUpdate(cmdbUtil.jsonApi.encode(payload));

	if (!checkResult.success) {
		throw new Error(gs.getMessage('CMDB Identification Error occured.'));
	}
	if (checkResult.success && !checkResult.insert && checkResult.sysId) {
		return checkResult.sysId;
	}
	return '';
};

ProductInstanceUtil.getEntityJson = function(entityGr) {
	var entityJson = {};
	var columnName;
	var fields = entityGr.getFields();
	for (var num = 0; num < fields.size(); num++) {
		columnName = fields.get(num).getName();
		if (columnName.indexOf('sys_') !== 0) {
			entityJson[columnName] = entityGr.getValue(columnName);
		}
	}
	return entityJson;
};

/**
 * Returns true if PID regeneration is required
 */
ProductInstanceUtil.isPIDRegenerationRequired = function(productInstanceClass, modelCategoryId, entityGr) {
	var pidConfig = ProductInstanceUtil.getPIDConfig(productInstanceClass, modelCategoryId);
	for (var i = 0; i < pidConfig.configs.length; i++) {
		for (var p = 0; p < pidConfig.configs[i].parameters.length; p++) {
			var paramClassAttributeName = pidConfig.configs[i].parameters[p].parameter_class_attribute_name;
			if (entityGr[paramClassAttributeName].changes()) {
				return true;
			}
			if (paramClassAttributeName.contains('.')) {
				var dotWalkFields = paramClassAttributeName.split('.');
				if (entityGr[dotWalkFields[0]].changes()) {
					return true;
				}
			}
		}
	}
	return false;
};

ProductInstanceUtil.getPIDAttrForEntity = function(entityGr, valueHash, getByParamName) {
	var pidConfig = ProductInstanceUtil.getPIDConfig(entityGr.sys_class_name, entityGr.model_category);
	var entityJson = {};
	var configs = pidConfig.configs;
	if (gs.nil(configs)) {
		return entityJson;
	}
	for (var i = 0; i < pidConfig.configs.length; i++) {
		for (var p = 0; p < pidConfig.configs[i].parameters.length; p++) {
			var paramClassAttributeName = pidConfig.configs[i].parameters[p].parameter_class_attribute_name;
			var paramName = pidConfig.configs[i].parameters[p].parameter_name;
			var value;
			var jsonKey = getByParamName ? paramName : paramClassAttributeName;
			// If jsonKey is blank, paramName is considered
			if (gs.nil(jsonKey)) {
				jsonKey = paramName;
			}
			entityJson[jsonKey] = '';
			if (paramClassAttributeName.contains('.')) { // {parent.serial_number: '1234'} or {parent: {serial_number: }
				var dotWalkFields = paramClassAttributeName.split('.');
				if (valueHash) {
					value = valueHash[dotWalkFields[0]];
				}
				if (!value || !value[dotWalkFields[1]]) {
					value = entityGr[dotWalkFields[0]].getRefRecord();
				}
				entityJson[jsonKey] = value[dotWalkFields[1]];
			} else {
				var fieldType = '';
				if (entityGr.isValidField(jsonKey)) {
					fieldType = String(entityGr[jsonKey].getED().getInternalType());
				}
				entityJson[jsonKey] = (valueHash
				&& (valueHash[paramClassAttributeName] || valueHash[paramName]))
				|| entityGr[paramClassAttributeName].getValue() || entityGr[paramName].getValue();
				if (fieldType === 'reference' && !gs.nil(entityJson[jsonKey]) && typeof (entityJson[jsonKey]) === 'object') {
					entityJson[jsonKey] = entityJson[jsonKey].getUniqueValue();
				}
			}
		}
	}
	return entityJson;
};
