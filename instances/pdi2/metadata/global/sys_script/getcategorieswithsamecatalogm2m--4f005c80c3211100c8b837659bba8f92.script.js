getCategoriesWithSameCatalogM2M();

function getCategoriesWithSameCatalogM2M() {
  var catalog = current.sc_catalog;
  if (catalog == '')
      return;
  lookup.addQuery('sc_catalog', catalog);
}
