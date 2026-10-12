var MODEL_CATEGORY_NA = 'NOT_AVAILABLE';
var PREFIX_CI_CLASS_MC = 'MC_FOR_CLASS_';
var PREFIX_MODEL_MC = 'MODEL_MC_CACHE_';
var session = gs.getSession();
updateModelCategory();

function getModelCategoryForCIclass(className, isInteractive) {
	var key = PREFIX_CI_CLASS_MC + className;
	if (!isInteractive) {
		var modeCategoryId = session.getClientData(key);
		if (!gs.nil(modeCategoryId)) {
			if (modeCategoryId + '' === MODEL_CATEGORY_NA) {
				return '';
			}
			return modeCategoryId;
		}
	}
	var cat = new GlideRecord('cmdb_model_category');
	cat.addQuery('cmdb_ci_class', className);
	cat.query();
	if (cat.next()) {
		if (!isInteractive) {
			session.putClientData(key, cat.getUniqueValue());
		}
		return cat.getUniqueValue();
	} else {
		if (!isInteractive) {
			session.putClientData(key, MODEL_CATEGORY_NA);
		}
	}
	return '';
}

function updateModelCategoryListOfModel(modelId, modelCategoryId, isInteractive) {
	var model = new GlideRecord('cmdb_model');
	if (model.get(modelId)) {
		var modelCategoryList = String(model.cmdb_model_category);
		if (modelCategoryList.indexOf(modelCategoryId) < 0) {
			if (modelCategoryList != '')
				model.cmdb_model_category += ',' + modelCategoryId;
			else
				model.cmdb_model_category = modelCategoryId;
			model.update();
		}
		if (!isInteractive) {
			var key = PREFIX_MODEL_MC + modelId;
			session.putClientData(key, model.getValue('cmdb_model_category'));
		}
	}
}

function updateModelCategory() {
	var isInteractive = session.isInteractive();
	// find the category
	var className = current.getValue('sys_class_name');
	var modelCategoryId = getModelCategoryForCIclass(className, isInteractive);
	
	if (!gs.nil(modelCategoryId)) {
		var modelId = current.getValue('model_id');
		var modelNeedsUpdate;
		if (isInteractive) {
			modelNeedsUpdate = true;
		} else {
			// Check in cache if this model category is already associated with the model
			var key = PREFIX_MODEL_MC + modelId;
			var cachedCategoryValue = session.getClientData(key);
			modelNeedsUpdate = gs.nil(cachedCategoryValue) || cachedCategoryValue.indexOf(modelCategoryId) < 0;
		}	
		if (modelNeedsUpdate) {
			if (!gs.nil(modelId) && modelId.toUpperCase() != 'NULL') {
				updateModelCategoryListOfModel(modelId, modelCategoryId, isInteractive);
			}
		}
	}
}
