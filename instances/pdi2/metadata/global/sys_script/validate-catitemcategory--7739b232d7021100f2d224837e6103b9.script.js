gs.addErrorMessage(gs.getMessage('Catalog item: [{0}] already exists in category: [{1}]', [GlideappCatalogItem.get(current.sc_cat_item).getName(), GlideappCategory.get(current.sc_category).getTitle()]));
current.setAbortAction(true);
