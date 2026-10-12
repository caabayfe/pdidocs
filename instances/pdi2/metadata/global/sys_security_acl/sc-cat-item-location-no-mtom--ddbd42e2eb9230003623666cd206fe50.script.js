gs.hasRole('catalog_admin') || new SNCCatalogUtil().canWrite(current.sc_cat_item, current.isNewRecord()) ;
