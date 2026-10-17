gs.hasRole('catalog_admin') || current.isNewRecord() || current.sc_cat_item.sc_catalog.manager + '' == gs.getUserID() || (current.sc_cat_item.sc_catalog.editors + '' ).indexOf(gs.getUserID()) != -1 ;
