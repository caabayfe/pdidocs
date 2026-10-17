var model = new GlideRecord('cmdb_model');
if (model.get(current.parent)) {
   var updateModel = false;
   
   // mark the model as a bundle if not already
   if (model.bundle == false) {
      model.bundle = true;
      updateModel = true;
   }
   
   // when adding a component to a model with no category, make the model an abstract bundle
   if (model.cmdb_model_category.nil()) {
      var bundleCategory = new GlideRecord('cmdb_model_category');
      bundleCategory.addQuery('bundle', true);
      bundleCategory.query();
      if (bundleCategory.next()) {
         model.cmdb_model_category = bundleCategory.sys_id;
         updateModel = true;
      }
   }
   
   if (updateModel === true)
      model.update();
}
