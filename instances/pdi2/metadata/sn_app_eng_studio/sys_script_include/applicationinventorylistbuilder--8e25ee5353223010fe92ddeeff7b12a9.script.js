var ApplicationInventoryListBuilder = (function() {
  return {
    build: function(applicationSysId) {
       AccessValidator.verifyApplicationAccess(applicationSysId);

          var applicationInventory = ApplicationsDataModel.generate(applicationSysId);

          applicationInventory["taxonomy_categories"] = new TaxonomyCategoriesDataModel().generate();
          applicationInventory["taxonomy_definitions"] = new TaxonomyDefinitionsDataModel().generate();
          applicationInventory["files"] = FileDataBuilder.build([applicationSysId]);
          applicationInventory["details"] = AppDetailsBuilder.build(applicationSysId);
          applicationInventory["permissions"] = AppPermissionsBuilder.build(applicationSysId);

          return applicationInventory;
      }
  };

})();
