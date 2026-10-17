(function executeRule(current, previous /*null when async*/) {

	var modelCategorySysId = current.getValue('cmdb_model_category');
	var modeCategoryGr = new GlideRecord('cmdb_model_category');	
	modeCategoryGr.get(modelCategorySysId);
	modeCategoryGr.setValue('is_product_instance', true);
	modeCategoryGr.update();
	gs.addInfoMessage(gs.getMessage("This will make model category and it's child categories product instance enabled."));

})(current, previous);
