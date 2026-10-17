/* global GlideScriptedExtensionPoint */
var AssetProductInstanceUtil = Class.create();
AssetProductInstanceUtil.prototype = {
	initialize: function() {},

	type: 'AssetProductInstanceUtil',
};
AssetProductInstanceUtil.ENABLE_PID_RECALCULATION_FOR_CHILD_ASSET = 'sn_itam_enable_pid_recalculation_for_child_asset';
/* Creates the asset id for the given asset details.
If the asset exists already with given details the asset id is returned.
*/
AssetProductInstanceUtil.createOrGetAsset = function(modelCategoryGr, modelGr, assetDetails) {
	var output = {};
	var assetID;
	if (gs.nil(modelCategoryGr) || gs.nil(modelGr)) {
		output.status = 'failed';
		output.assetID = '';
		output.errorMessage = gs.getEscapedMessage('Invalid model category or model reference.');
		return output;
	}
	var assetClass = modelCategoryGr.asset_class;
	if (gs.nil(assetClass)) {
		output.status = 'failed';
		output.assetID = '';
		output.errorMessage = gs.getEscapedMessage('Model category does not have an asset class.');
		return output;
	}

	var assetGr = new GlideRecord(assetClass);
	assetGr.initialize();
	assetGr.model = modelGr.getUniqueValue();
	for (var field in assetDetails) {
		if (assetGr.isValidField(field)) {
			assetGr.setValue(field, assetDetails[field]);
		} else if (field === 'skip_sync_after_br') {
			assetGr.skip_sync_after_br = assetDetails[field];
		}
	}
	try {
		assetID = AssetProductInstanceUtil.identifyAsset(assetGr);
	} catch (error) {
		output.errorMessage = gs.getEscapedMessage('Failed to create the asset record {0}', [error]);
		output.status = 'failed';
		return output;
	}
	if (!gs.nil(assetID)) {
		output.assetID = assetID;
		output.status = 'success';
		return output;
	}
	// Skip check for duplicate asset
	assetGr.skip_duplicate_check = true;
	assetID = assetGr.insert();
	output.assetID = assetID;
	if (gs.nil(assetID)) {
		output.errorMessage = gs.getEscapedMessage('Failed to create the asset record');
		output.status = 'failed';
		return output;
	}
	output.status = 'success';
	return output;
};

AssetProductInstanceUtil.identifyEntity = function(entityGr) {
	try {
		return global.ProductInstanceUtil.identifyEntityThroughIRE(entityGr);
	} catch (error) {
		gs.addErrorMessage(gs.getEscapedMessage('Failed to create the asset record {0}', [error]));
		return '';
	}
};

AssetProductInstanceUtil.isPIDOptional = function(assetGr) {
	if ((assetGr.skip_asset_pid && assetGr.skip_asset_pid === true)
        || assetGr.getValue('substatus') === 'pre_allocated' || assetGr.getValue('install_status') === '2') {
		return true;
	}
	var skipPIDChecks = new GlideScriptedExtensionPoint()
		.getExtensions('global.AssetProductInstanceExtPoint');
	for (var i = 0; i < skipPIDChecks.length; i++) {
		var result = skipPIDChecks[i].isPIDOptional(assetGr);
		if (result === true) {
			return result;
		}
	}
	return false;
};

AssetProductInstanceUtil.skipPIDGeneration = function(assetGr) {
	if (assetGr.getValue('substatus') === 'pre_allocated') {
		return true;
	}
	// Skip for consumables
	var consumable = new global.TableUtils(AssetManagementConstants.ASSET_CLASSES.CONSUMABLE);
	if (consumable.getAllExtensions().indexOf(assetGr.getValue('sys_class_name')) > -1) {
		return true;
	}
	return false;
};

AssetProductInstanceUtil.validatePIDForAsset = function(grAsset, isUpdate) {
	// Identification of entity with same PID
	var hasDuplicate = AssetProductInstanceUtil.hasDuplicateAsset(grAsset);
	if (hasDuplicate) {
		var errorMessage = '';
		if (isUpdate) {
			errorMessage = gs.getMessage('Asset with generated product instance identifier already exists. Failed to update the asset. Please refer to product documentation regarding product instance');
		} else {
			errorMessage = gs.getMessage('Asset with generated product instance identifier already exists. Failed to create the asset. Please refer to product documentation regarding product instance');
		}
		throw new Error(errorMessage);
	}
};

AssetProductInstanceUtil.calculatePIDForAsset = function(grAsset, isUpdate, additionalFields) {
	// Check if PID generation can be skipped
	if (AssetProductInstanceUtil.skipPIDGeneration(grAsset)) {
		return;
	}
	// eslint-disable-next-line
	isUpdate = gs.nil(isUpdate) ? !(grAsset.isNewRecord()) : isUpdate;
	var productInstanceID = ProductInstanceUtil.generatePIDForEntity(grAsset.model_category,
		grAsset.sys_class_name, grAsset, additionalFields);

	if (productInstanceID && grAsset.product_instance_id === productInstanceID) {
		return;
	}
	var errorMessage = '';
	if (gs.nil(productInstanceID)) {
		if (AssetProductInstanceUtil.isPIDOptional(grAsset)) {
			grAsset.product_instance_id = productInstanceID || '';
		} else {
			if (!isUpdate) {
				errorMessage = gs.getMessage('Failed to create the asset as product instance identifier generation failed. Please refer to product documentation regarding product instance');
			} else if (grAsset.product_instance_id) {
				errorMessage = gs.getMessage('Failed to update the asset as product instance identifier generation failed. Please refer to product documentation regarding product instance');
			}
			if (errorMessage) {
				throw new Error(errorMessage);
			}
		}
		return;
	}
	grAsset.product_instance_id = productInstanceID;
	AssetProductInstanceUtil.validatePIDForAsset(grAsset, isUpdate);
};

AssetProductInstanceUtil.syncPidFromAssetToCI = function(asset, ci) {
	if (ProductInstanceUtil.isProductInstance(String(asset.model_category))) {
		ci.product_instance_id = asset.product_instance_id;
	}
};

/*
input - parentAssetSysId
output(JSON containing child asset details) - sys_id,
		product_instance_id,
		model_component_id,
		pid_attributes,
		model
		model_category
*/

AssetProductInstanceUtil.getAssetChildren = function(parentAssetSysId) {
	var assetChildren = [];
	var parentAssetGr = new GlideRecord(AssetManagementConstants.ASSET_CLASSES.ASSET);
	if (parentAssetGr.get(parentAssetSysId)) {
		var assetGr = new GlideRecord(AssetManagementConstants.ASSET_CLASSES.ASSET);
		assetGr.addQuery('parent', parentAssetSysId);
		assetGr.query();
		while (assetGr.next()) {
			var assetChild = {};
			assetChild.sys_id = assetGr.getUniqueValue();
			assetChild.product_instance_id = assetGr.getValue('product_instance_id');
			assetChild.model_component_id = assetGr.getValue('model_component_id');
			// eslint-disable-next-line
            assetChild.pid_attributes = ProductInstanceUtil.getPIDAttrForEntity(new GlideRecordUtil().getGR(assetGr.getValue('sys_class_name'), assetGr.getUniqueValue()), '', true);
			assetChild.model = assetGr.getValue('model');
			assetChild.model_category = assetGr.getValue('model_category');
			assetChildren.push(assetChild);
		}
		return assetChildren;
	}
	return gs.getEscapedMessage('Invalid parent asset');
};

/*
input - parentAssetSysId, childAssetSysId, modelComponentId(optional)
output(JSON containing child asset details) - status and message
*/
AssetProductInstanceUtil.linkAssetToParentAsset = function(parentAssetSysId, assetSysId, modelComponentId,
	skipSyncToIb) {
	// Check for empty inputs
	if (gs.nil(parentAssetSysId)) {
		// eslint-disable-next-line
        return _generateResponse('failed', 'Empty parent');
	}
	if (gs.nil(assetSysId)) {
		// eslint-disable-next-line
        return _generateResponse('failed', 'Empty child');
	}

	// Check for valid inputs
	var parentGr = new GlideRecordUtil().getGR(AssetManagementConstants.ASSET_CLASSES.ASSET, parentAssetSysId);
	if (gs.nil(parentGr)) {
		// eslint-disable-next-line
        return _generateResponse('failed', 'Invalid parent');
	}
	if (parentGr.getValue('sys_class_name') === 'alm_consumable') {
		// eslint-disable-next-line
        return _generateResponse('failed', 'Parent cannot be a consumable asset');
	}
	var assetGr = new GlideRecordUtil().getGR(AssetManagementConstants.ASSET_CLASSES.ASSET, assetSysId);
	if (gs.nil(assetGr) || !gs.nil(assetGr.getValue('parent'))) {
		// eslint-disable-next-line
        return _generateResponse('failed', 'Invalid child or already parent exist for this child asset');
	}

	// eslint-disable-next-line
    if (!gs.nil(modelComponentId) && gs.nil(new GlideRecordUtil().getGR(AssetManagementConstants.MODEL_CLASSES.MODEL_COMPONENT, modelComponentId))) {
		// eslint-disable-next-line
        return _generateResponse('failed', 'Invalid model component');
	}
	assetGr.setValue('parent', parentAssetSysId);
	if (!gs.nil(modelComponentId)) {
		assetGr.setValue('model_component_id', modelComponentId);
	}
	if (!gs.nil(skipSyncToIb)) {
		assetGr.skip_sync_after_br = skipSyncToIb;
	}
	if (assetGr.update()) {
		// eslint-disable-next-line
        return _generateResponse('success', 'Asset added to parent');
	}
	// eslint-disable-next-line
    return _generateResponse('failed', gs.getEscapedMessage('Update failed'));

	function _generateResponse(status, errorMessage) {
		var result = {};
		result.status = status;
		result.message = errorMessage;
		return result;
	}
};

/**
 * Returns the sysId if a match is found with same asset details based on PID configurations
 */
AssetProductInstanceUtil.identifyAsset = function(asset) {
	function getNestedQuery(params) {
		var gq = new GlideQuery();
		params.forEach(function(param) {
			gq = gq.where(param, asset[param]);
		});
		return gq;
	}
	function attributeEmpty (attrs) {
		for (var i = 0; i < attrs.length; i++) {
			if (gs.nil(asset[attrs[i]])) {
				return true;
			}
		}
		return false;
	}
	function buildAppliedRule(attrs, appliedAttr) {
		var appliedRule = {};
		for (var i = 0; i < attrs.length; i++) {
			appliedRule[attrs[i]] = asset.getValue(attrs[i]);
			appliedAttr.push(attrs[i]);
		}
		return appliedRule;
	}
	function derivePIDAttributes(pidConfigs) {
		var pidAttributes = [['product_instance_id']];
		for (var i = 0; i < pidConfigs.configs.length; i++) {
			var pidConfig = pidConfigs.configs[i];
			var pidAttributesRule = [];
			for (var p = 0; p < pidConfig.parameters.length; p++) {
				var attr = pidConfig.parameters[p].parameter_class_attribute_name;
				if (!attr) {
					pidAttributesRule = [];
					break;
				}
				pidAttributesRule.push(attr);
			}
			if (pidAttributesRule.length > 0) {
				pidAttributes.push(pidAttributesRule);
			}
		}
		return pidAttributes;
	}

	var pidConfigs = ProductInstanceUtil.getPIDConfig(asset.getValue('sys_class_name'), asset.getValue('model_category'));
	var rulesArr = derivePIDAttributes(pidConfigs);
	var appliedAttr = [];
	var appliedRules = [];
	var gq = new GlideQuery(AssetManagementConstants.ASSET_CLASSES.ASSET);
	var isFirstRule = true;
	var whereType = 'where';
	rulesArr.forEach(function(rule) {
		// Checking if values against the attributes of the rule are empty
		if (rule.length === 0 || attributeEmpty(rule)) {
			return;
		}
		// Pushing the rules applied along with the values against the attributes defined in the rule
		appliedRules.push(buildAppliedRule(rule, appliedAttr));
		if (!isFirstRule) {
			whereType = 'orWhere';
		}
		isFirstRule = false;
		if (rule.length === 1) {
			gq = gq[whereType](rule[0], asset[rule[0]]);
		} else {
			// Preparing the nested query if there are multiple attributes against a rule
			gq = gq[whereType](getNestedQuery(rule));
		}
	});
	var result = gq.toGlideRecord();
	// Querying only if there is any rule applied
	if (appliedRules.length === 0) {
		return '';
	}
	result.query();
	var records = [];
	while (result.next()) {
		var temp = {};
		// Iterating over the applied attributes and pushing those values to a array as an object
		for (var i = 0; i < appliedAttr.length; i++) {
			if (!gs.nil(result[appliedAttr[i]])) {
				temp[appliedAttr[i]] = result.getValue(appliedAttr[i]);
			}
		}
		temp.sys_id = result.getValue('sys_id');
		records.push(temp);
		temp = {};
	}
	if (records.length === 0) {
		return '';
	}
	// Iterating over the applied rules in the order to fetch the first record based on the rule
	for (var j = 0; j < appliedRules.length; j++) {
		// eslint-disable-next-line
		var filteredArray = records.filter(function(record) {
			var keys = Object.keys(appliedRules[j]);
			for (var k = 0; k < keys.length; k++) {
				if (gs.nil(record[keys[k]])
				|| record[keys[k]].toString() !== appliedRules[j][keys[k]].toString()) {
					return false;
				}
			}
			// Skipping the same record
			if (gs.nil(asset.sys_id) || (record.sys_id.toString() !== asset.sys_id.toString())) {
				return true;
			}
			return false;
		});
		if (filteredArray.length > 0) {
			return filteredArray[0].sys_id.toString();
		}
	}
	return '';
};

/**
 * Returns true if there is a duplicate entity.
 * If skip_duplicate_check is set to true then it returns false
 */
AssetProductInstanceUtil.hasDuplicateAsset = function(assetGr) {
	// Skip the check for duplicate asset
	if (assetGr.skip_duplicate_check && assetGr.skip_duplicate_check === true) {
		return false;
	}
	var existingID = AssetProductInstanceUtil.identifyAsset(assetGr);
	var currentID = assetGr.getUniqueValue();
	return !gs.nil(existingID) && currentID !== existingID;
};
