if (current.sc_cat_item != '') {
   GlideappCatalogItem.get(current.sc_cat_item).updateCatalogsList();
   GlideappCatalogItem.get(current.sc_cat_item).checkCategories();
}
