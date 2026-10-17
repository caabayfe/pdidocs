if (JSUtil.nil(current.sc_catalogs) && JSUtil.notNil(current.category))
    current.sc_catalogs = GlideappCategory.get(current.category).getCatalog();
else if (JSUtil.nil(current.catalogs) && JSUtil.nil(current.category) && SNC.Catalog.getTotalCatalogCount() == 1)
    current.sc_catalogs = SNC.Catalog.getDefaultCatalog();
else if (JSUtil.notNil(current.sc_catalogs) && JSUtil.notNil(current.category)) {
    if (current.sc_catalogs.indexOf(GlideappCategory.get(current.category).getCatalog()) == -1) {
        gs.addErrorMessage(gs.getMessage('You cannot select category [{0}] because it does not exist in selected catalog(s)', current.category.title));
        current.setAbortAction(true);
    }
}
