var modelCategorySysId = current.getUniqueValue();
var isProductInstance = current.getValue('is_product_instance');

//	find all direct children model categories
var childCategories = [];
var modeCategoryGr = new GlideRecord('cmdb_model_category');
modeCategoryGr.addQuery('parent_cateogry', modelCategorySysId);
modeCategoryGr.query();
while (modeCategoryGr.next()) {
	childCategories.push(modeCategoryGr.getUniqueValue());
}

//	we don't want to update those categories that have an explicit pid config defined
var childCategoriesWithPID = [];
var pidConfigGr = new GlideAggregate('product_instance_identifier_configuration');
pidConfigGr.addQuery('cmdb_model_category', 'IN', childCategories);
pidConfigGr.addQuery('active', 1);
pidConfigGr.groupBy('cmdb_model_category');
pidConfigGr.query();
while (pidConfigGr.next()) {
	childCategoriesWithPID.push(pidConfigGr.getValue('cmdb_model_category'));
}

if (childCategoriesWithPID.length > 0) {
	childCategories = new ArrayUtil().diff(childCategories, childCategoriesWithPID);
}

// update all other child categories with is_product_instance value
if (childCategories.length > 0) {
	modeCategoryGr = new GlideRecord('cmdb_model_category');
	modeCategoryGr.addQuery('sys_id', 'IN', childCategories);
	modeCategoryGr.query();
	modeCategoryGr.setValue('is_product_instance', isProductInstance);
	modeCategoryGr.updateMultiple();
}
