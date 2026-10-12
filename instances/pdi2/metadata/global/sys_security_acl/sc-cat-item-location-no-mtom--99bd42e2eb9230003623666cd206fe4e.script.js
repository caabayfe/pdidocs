gs.hasRole('catalog_admin') || new SNCCatalogUtil().canRead(current.sc_cat_item, current.isNewRecord()) ;
