if (current.active.changesTo(false)) {
   makeAllFeaturesInActive(current);
}

if (current.product.changes() && !current.product.isNil()) {
   updateProductInAllFeatures(current);
}

function makeAllFeaturesInActive(me) {
   var features = new GlideRecord('release_feature');
   features.initialize();
   features.addQuery('release', '=', me.sys_id);  
   features.query();
   while (features.next()) {
       features.active.setValue(false);
       features.update();
   }
}

function updateProductInAllFeatures(me) {
   var features = new GlideRecord('release_feature');
   features.initialize();
   features.addQuery('release', '=', me.sys_id);
   features.query();   
   while (features.next()) {      
       features.product.setValue(me.product);
       features.update();
   }
}
