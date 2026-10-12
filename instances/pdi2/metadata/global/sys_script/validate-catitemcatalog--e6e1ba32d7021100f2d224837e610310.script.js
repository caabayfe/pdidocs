gs.addErrorMessage(gs.getMessage('Catalog item: [{0}] already exists in catalog: [{1}]', [GlideappCatalogItem.get(current.sc_cat_item).getName(), SNC.Catalog.get(current.sc_catalog).getTitle()]));
current.setAbortAction(true);
